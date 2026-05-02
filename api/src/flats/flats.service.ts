import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { Flat, FlatDocument } from './schemas/flat.schema';
import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

@Injectable()
export class FlatsService {
  constructor(
    @InjectModel(Flat.name) private readonly flatModel: Model<FlatDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(ownerId: string, dto: CreateFlatDto): Promise<FlatDocument> {
    const isDev = this.configService.get('NODE_ENV') !== 'production';
    // In development, auto-approve flats and generate an invite code immediately
    // (mirrors the auto-verify behaviour for new users)
    const inviteCode = isDev ? `FLAT-${nanoid()}` : undefined;
    return this.flatModel.create({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
      status: isDev ? 'approved' : 'pending',
      ...(isDev && { inviteCode, approvedAt: new Date() }),
    });
  }

  async findByOwner(ownerId: string): Promise<FlatDocument[]> {
    return this.flatModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
  }

  async findById(id: string): Promise<FlatDocument> {
    const flat = await this.flatModel.findById(id).exec();
    if (!flat) throw new NotFoundException('Flat not found');
    return flat;
  }

  async findByInviteCode(code: string): Promise<FlatDocument | null> {
    // Match on invite code alone — no status restriction
    return this.flatModel.findOne({ inviteCode: code }).exec();
  }

  async update(id: string, ownerId: string, dto: UpdateFlatDto): Promise<FlatDocument> {
    const flat = await this.findById(id);
    if (flat.ownerId.toString() !== ownerId) throw new ForbiddenException();

    const rentChanged = dto.monthlyRent !== undefined && dto.monthlyRent !== flat.monthlyRent;

    const update: Partial<Flat> & { status?: string } = { ...dto };
    if (rentChanged) {
      update.status = 'pending';
      update.requiresReApproval = true;
    }

    const updated = await this.flatModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!updated) throw new NotFoundException('Flat not found');
    return updated;
  }

  async generateInviteCode(id: string, ownerId: string): Promise<FlatDocument> {
    const flat = await this.findById(id);
    if (flat.ownerId.toString() !== ownerId) throw new ForbiddenException();

    const code = `FLAT-${nanoid()}`;
    const updated = await this.flatModel.findByIdAndUpdate(
      id,
      { inviteCode: code },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Flat not found');
    return updated;
  }

  async deactivate(id: string, ownerId: string): Promise<FlatDocument> {
    const flat = await this.findById(id);
    if (flat.ownerId.toString() !== ownerId) throw new ForbiddenException();

    const updated = await this.flatModel.findByIdAndUpdate(
      id,
      { status: 'inactive', inviteCode: undefined },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Flat not found');
    return updated;
  }

  // Admin operations
  async adminFindAll(status?: string, page = 1, limit = 20) {
    const filter = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.flatModel
        .find(filter)
        .populate('ownerId', 'firstName lastName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.flatModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async adminApprove(id: string, adminId: string): Promise<FlatDocument> {
    const updated = await this.flatModel.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: new Types.ObjectId(adminId),
        approvedAt: new Date(),
        requiresReApproval: false,
        $unset: { rejectionReason: 1 },
      },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Flat not found');
    return updated;
  }

  async adminReject(id: string, adminId: string, reason: string): Promise<FlatDocument> {
    const updated = await this.flatModel.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason, approvedBy: new Types.ObjectId(adminId) },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Flat not found');
    return updated;
  }
}
