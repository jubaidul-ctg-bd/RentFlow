import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ data: User[]; total: number }>({
    queryKey: ["admin-users", search],
    queryFn: () =>
      api
        .get(`/admin/users?search=${encodeURIComponent(search)}`)
        .then((r) => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      api.patch(`/admin/users/${id}/suspend`, { suspend }),
    onSuccess: (_, { suspend }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(suspend ? "User suspended" : "User unsuspended");
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((r) => (
                        <span
                          key={r}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.isSuspended ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Suspended
                      </span>
                    ) : user.isVerified ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        suspendMutation.mutate({
                          id: user._id,
                          suspend: !user.isSuspended,
                        })
                      }
                      disabled={suspendMutation.isPending}
                      className={`flex items-center gap-1 text-xs font-medium ${
                        user.isSuspended
                          ? "text-green-600 hover:text-green-700"
                          : "text-red-600 hover:text-red-700"
                      }`}
                    >
                      {user.isSuspended ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      {user.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && (
            <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
              {data.total} users total
            </div>
          )}
        </div>
      )}
    </div>
  );
}
