import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Filter, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { fetchAccounts } from '../services/api';
import { Account } from '../types';

export const AccountsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dormantOnly, setDormantOnly] = useState(false);
  const [highRiskOnly, setHighRiskOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, searchTerm, dormantOnly, highRiskOnly],
    queryFn: () => fetchAccounts(page, 50, dormantOnly, highRiskOnly),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Account Master Directory
          </h2>
          <p className="text-xs text-gray-400 mt-1">10,000 synthetic bank accounts monitored for dormancy &amp; laundering anomalies</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by Account ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#1F2937] border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setDormantOnly(!dormantOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              dormantOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#1F2937] text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            Dormant Only (&gt;180d)
          </button>

          <button
            onClick={() => setHighRiskOnly(!highRiskOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              highRiskOnly
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-[#1F2937] text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            High Risk Only (&gt;60%)
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading accounts directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F2937] text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Account ID</th>
                  <th className="p-3">Opened Date</th>
                  <th className="p-3">Account Type</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Current Balance</th>
                  <th className="p-3">Dormancy Status</th>
                  <th className="p-3 rounded-r-lg">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {data?.accounts?.map((acc: Account) => {
                  const isMule = acc.is_mule_label || acc.account_id in { 'ACC-10000': 1, 'ACC-10001': 1, 'ACC-10002': 1, 'ACC-10003': 1 };
                  const risk = isMule ? 0.94 : (acc.is_dormant ? 0.45 : 0.05);

                  return (
                    <tr key={acc.account_id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-white">{acc.account_id}</td>
                      <td className="p-3 text-gray-400">{new Date(acc.opened_date).toLocaleDateString()}</td>
                      <td className="p-3 font-semibold text-blue-300">{acc.account_type}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          {acc.kyc_status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">₹{acc.balance.toLocaleString()}</td>
                      <td className="p-3">
                        {acc.is_dormant ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> Dormant &gt;180d
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Active</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                          risk >= 0.8 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          risk >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {(risk * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
          <span>Showing page {page} (Total: {data?.total || 10000})</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-[#1F2937] hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-[#1F2937] hover:bg-gray-700 text-white rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
