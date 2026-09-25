import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { Users, Shield, ShieldOff, Mail, Briefcase, Globe, AlertCircle } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleBlockStatus = async (userId, currentStatus) => {
    try {
      const updatedUser = await userService.updateUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-accent" /> User Management
          </h1>
          <p className="text-slate-400 mt-1">Manage advertisers and publishers on the platform</p>
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="text-accent" /> User Management
        </h1>
        <p className="text-slate-400 mt-1">Manage advertisers and publishers on the platform</p>
      </div>

      <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-lg font-medium text-slate-200 flex items-center gap-2">
            Platform Users <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{users.length}</span>
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm font-medium border-b border-slate-700">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h2 className="text-xl font-medium text-slate-200">No users found</h2>
                    <p className="text-slate-400 mt-2">There are currently no registered users on the platform.</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{user.name}</span>
                        <span className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize border ${
                        user.role === 'advertiser' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        {user.role === 'advertiser' ? (
                          <>
                            <span className="text-slate-200 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-500" /> {user.companyName}</span>
                            <span className="text-slate-400 text-xs ml-5.5 mt-0.5 capitalize">{user.industry}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-200 flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-500" /> {user.websiteName}</span>
                            <span className="text-slate-400 text-xs ml-5.5 mt-0.5 lowercase">{user.websiteUrl}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.blocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-status-red/10 text-status-red border-status-red/20">
                          <AlertCircle className="w-3.5 h-3.5" /> BLOCKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-status-green/10 text-status-green border-status-green/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-green" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleBlockStatus(user.id, !!user.blocked)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          user.blocked 
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600' 
                            : 'bg-status-red/10 text-status-red hover:bg-status-red/20 border-status-red/20'
                        }`}
                      >
                        {user.blocked ? (
                          <><Shield className="w-4 h-4" /> Unblock</>
                        ) : (
                          <><ShieldOff className="w-4 h-4" /> Block</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
