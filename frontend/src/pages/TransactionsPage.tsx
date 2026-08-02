import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightLeft, Search, Filter } from 'lucide-react';
import { fetchTransactions } from '../services/api';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => fetchTransactions(page, 50),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-blue-400" />
            Transaction Ledger &amp; Directed Graph Edges
          </h2>
          <p className="text-xs text-gray-400 mt-1">100,000 directed financial transactions forming the money movement network</p>
        </div>
      </div>

      <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading transactions log...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F2937] text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Txn ID</th>
                  <th className="p-3">Sender (Source)</th>
                  <th className="p-3">Receiver (Target)</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {data?.transactions?.map((tx: Transaction) => (
                  <tr key={tx.transaction_id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-gray-400">{tx.transaction_id}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{tx.sender}</td>
                    <td className="p-3 font-mono font-bold text-blue-300">{tx.receiver}</td>
                    <td className="p-3 font-extrabold text-white">₹{tx.amount.toLocaleString()}</td>
                    <td className="p-3 text-gray-400">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-gray-300">{tx.channel}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 font-bold bg-emerald-500/10 text-emerald-400 rounded-full text-[10px]">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
          <span>Showing page {page}</span>
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
