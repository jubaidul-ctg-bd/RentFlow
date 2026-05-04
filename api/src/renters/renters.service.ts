import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RenterLink, RenterLinkDocument } from './schemas/renter-link.schema';
import { FlatsService } from '../flats/flats.service';

@Injectable()
export class RentersService {
  constructor(
    @InjectModel(RenterLink.name) private readonly renterLinkModel: Model<RenterLinkDocument>,
    private readonly flatsService: FlatsService,
  ) {}

  async linkByCode(renterId: string, inviteCode: string): Promise<RenterLinkDocument> {
    const flat = await this.flatsService.findByInviteCode(inviteCode);
    if (!flat) throw new BadRequestException('Invalid or expired invite code');

    const existing = await this.renterLinkModel.findOne({
      flatId: flat._id,
      renterId: new Types.ObjectId(renterId),
    }).exec();

    if (existing) {
      if (existing.isActive) throw new ConflictException('Already linked to this flat');
      existing.isActive = true;
      return existing.save();
    }

    return this.renterLinkModel.create({
      flatId: flat._id,
      renterId: new Types.ObjectId(renterId),
    });
  }

  async findActiveLink(renterId: string): Promise<RenterLinkDocument | null> {
    return this.renterLinkModel
      .findOne({ renterId: new Types.ObjectId(renterId), isActive: true })
      .populate('flatId')
      .exec();
  }

  async findActiveLinks(renterId: string): Promise<RenterLinkDocument[]> {
    return this.renterLinkModel
      .find({ renterId: new Types.ObjectId(renterId), isActive: true })
      .populate('flatId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveLinkForFlat(
    renterId: string,
    flatId: string,
  ): Promise<RenterLinkDocument | null> {
    return this.renterLinkModel
      .findOne({
        renterId: new Types.ObjectId(renterId),
        flatId: new Types.ObjectId(flatId),
        isActive: true,
      })
      .populate('flatId')
      .exec();
  }

  async findAllByRenter(renterId: string): Promise<RenterLinkDocument[]> {
    return this.renterLinkModel
      .find({ renterId: new Types.ObjectId(renterId) })
      .populate('flatId')
      .exec();
  }

  async findAllByFlat(flatId: string): Promise<RenterLinkDocument[]> {
    return this.renterLinkModel
      .find({ flatId: new Types.ObjectId(flatId), isActive: true })
      .populate('renterId', 'firstName lastName email phone')
      .exec();
  }

  async revokeAccess(flatId: string, renterId: string): Promise<void> {
    const result = await this.renterLinkModel.findOneAndUpdate(
      { flatId: new Types.ObjectId(flatId), renterId: new Types.ObjectId(renterId) },
      { isActive: false },
    ).exec();
    if (!result) throw new NotFoundException('Renter link not found');
  }

  async unlinkFlat(renterId: string, flatId: string): Promise<void> {
    if (!Types.ObjectId.isValid(flatId)) {
      throw new BadRequestException('Invalid flat id');
    }
    const result = await this.renterLinkModel.findOneAndUpdate(
      { flatId: new Types.ObjectId(flatId), renterId: new Types.ObjectId(renterId), isActive: true },
      { isActive: false },
    ).exec();
    if (!result) throw new NotFoundException('Active link not found for this flat');
  }
}
