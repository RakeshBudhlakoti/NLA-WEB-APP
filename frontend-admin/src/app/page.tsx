"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  Users, 
  FileVideo, 
  Clock, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight, 
  Activity, 
  BarChart2, 
  PieChart as PieChartIcon,
  Eye,
  Trophy,
  Heart
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie 
} from 'recharts';
import Link from "next/link";

const chartData = [
  { name: 'Mon', views: 4000, interactions: 2400 },
  { name: 'Tue', views: 3000, interactions: 1398 },
  { name: 'Wed', views: 2000, interactions: 9800 },
  { name: 'Thu', views: 2780, interactions: 3908 },
  { name: 'Fri', views: 1890, interactions: 4800 },
  { name: 'Sat', views: 2390, interactions: 3800 },
  { name: 'Sun', views: 3490, interactions: 4300 },
];

const COLORS = ['#1d4ed8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [view, setView] = useState("overview");
  const [stats, setStats] = useState<any>({
    userCount: 0,
    postCount: 0,
    pendingCount: 0,
    likeCount: 0,
    connectionCount: 0,
    commentCount: 0,
    categoryDistribution: [],
    recentUsers: [],
    topPosts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchApi("/admin/stats");
        if (res.data) {
          setStats({
            ...res.data,
            commentCount: res.data.commentCount || 0,
            likeCount: res.data.likeCount || 0,
            connectionCount: res.data.connectionCount || 0,
            categoryDistribution: res.data.categoryDistribution || [],
            recentUsers: res.data.recentUsers || [],
            topPosts: res.data.topPosts || []
          });
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-admin-teal/30 border-t-admin-teal rounded-full animate-spin"></span>
        </div>
      </AdminLayout>
    );
  }

  const totalInteractions = (stats.commentCount || 0) + (stats.likeCount || 0);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Platform Insight <Zap className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Real-time intelligence for NLA Sports.</p>
        </div>
      </div>

      {/* Main Stats Grid - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Users className="w-4 h-4" />} 
          label="Total Athletes" 
          value={stats.userCount || 0} 
          color="blue" 
          link="/users"
          trend="+12% month"
        />
        <StatCard 
          icon={<FileVideo className="w-4 h-4" />} 
          label="Active Stories" 
          value={stats.postCount || 0} 
          color="teal" 
          link="/stories?status=APPROVED"
          trend="+5 today"
        />
        <StatCard 
          icon={<Clock className="w-4 h-4" />} 
          label="Pending Review" 
          value={stats.pendingCount || 0} 
          color="orange" 
          link="/stories?status=PENDING"
          alert={(stats.pendingCount || 0) > 0}
        />
        <StatCard 
          icon={<TrendingUp className="w-4 h-4" />} 
          label="Interactions" 
          value={totalInteractions} 
          color="indigo" 
          trend="Strong"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Chart Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                  {view === 'overview' ? 'Platform Growth' : 'Engagement Analysis'}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {view === 'overview' ? 'Story Views • Weekly' : 'Interactions • Weekly'}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button 
                  onClick={() => setView("overview")}
                  className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${view === 'overview' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setView("engagement")}
                  className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${view === 'engagement' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Engagement
                </button>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {view === 'overview' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F2994A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#F2994A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }} />
                    <Area type="monotone" dataKey="views" stroke="#F2994A" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }} />
                    <Line type="monotone" dataKey="interactions" stroke="#6366F1" strokeWidth={4} dot={{ r: 4, fill: '#6366F1' }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Stories Leaderboard */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Top Performing Stories</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Highest community impact</p>
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <th className="pb-4">Rank & Title</th>
                     <th className="pb-4 text-center">Views</th>
                     <th className="pb-4 text-center">Comments</th>
                     <th className="pb-4 text-center">Points</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {stats.topPosts?.map((post: any, index: number) => (
                     <tr key={post.id} className="group hover:bg-gray-50/50 transition-colors">
                       <td className="py-4">
                          <div className="flex items-center gap-4">
                             <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                               {index + 1}
                             </span>
                             <Link href={`/stories/${post.id}`} className="text-sm font-bold text-gray-900 hover:text-admin-teal line-clamp-1">{post.title}</Link>
                          </div>
                       </td>
                       <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500">
                             <Eye className="w-3.5 h-3.5" /> {post.views}
                          </div>
                       </td>
                       <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500">
                             <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                          </div>
                       </td>
                       <td className="py-4 text-center">
                          <span className="px-3 py-1 bg-admin-teal/10 text-admin-teal rounded-full text-xs font-black whitespace-nowrap">
                             {post.points.toLocaleString()} PTS
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Right Column: Insights & Feed */}
        <div className="space-y-8">
           {/* Content Focus: Half Donut */}
           <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Content Focus</h3>
                <BarChart2 className="w-4 h-4 text-gray-300" />
              </div>
              
              {stats.categoryDistribution?.length > 0 ? (
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="85%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="65%"
                        outerRadius="100%"
                        paddingAngle={4}
                        dataKey="count"
                        stroke="none"
                      >
                        {stats.categoryDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend below the half donut */}
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
                    {stats.categoryDistribution.map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-tight">{entry.name} ({entry.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                   <PieChartIcon className="w-12 h-12 mb-2 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No Category Data</p>
                </div>
              )}
           </div>

           {/* Recent Signups */}
           <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">New Signups</h3>
                <Link href="/users" className="text-[10px] font-black text-admin-teal uppercase tracking-widest hover:underline">View All</Link>
             </div>
             
             {stats.recentUsers?.length > 0 ? (
               <div className="space-y-6">
                 {stats.recentUsers.map((u: any) => (
                   <div key={u.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-admin-teal/10 group-hover:text-admin-teal transition-all uppercase text-xs overflow-hidden">
                           {u.avatar ? (
                             <img src={u.avatar.startsWith('http') ? u.avatar : `http://localhost:5000/uploads/avatars/${u.avatar}`} alt={u.name} className="w-full h-full object-cover" />
                           ) : (
                             u.name?.charAt(0) || '?'
                           )}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-gray-900 line-clamp-1">{u.name}</p>
                           <p className="text-[10px] text-gray-400 font-medium">{new Date(u.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <Link href={`/users?id=${u.id}`} className="p-2 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100">
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </Link>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                   <Users className="w-12 h-12 mb-2 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-center">Waiting for registrations</p>
                </div>
             )}
           </div>

           {/* Platform Pulse */}
           <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-6">Engagement Pulse</h3>
              <div className="space-y-6">
                <PulseMetric label="Partner Connections" value={stats.connectionCount || 0} target={500} color="blue" />
                <PulseMetric label="Athlete Stories" value={stats.postCount || 0} target={1000} color="teal" />
                <PulseMetric label="Community Buzz" value={totalInteractions} target={5000} color="orange" />
              </div>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, color, link, trend, alert }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-500",
    teal: "bg-teal-50 text-teal-500",
    orange: "bg-orange-50 text-orange-500",
    indigo: "bg-indigo-50 text-indigo-500"
  };

  const CardContent = (
    <div className={`bg-white p-5 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-col h-full relative overflow-hidden transition-all ${link ? 'hover:scale-[1.02] hover:shadow-xl' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        {alert && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-black text-gray-900">{typeof value === 'number' && isNaN(value) ? 0 : value.toLocaleString()}</h2>
        {trend && <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{trend}</span>}
      </div>
    </div>
  );

  return link ? <Link href={link}>{CardContent}</Link> : CardContent;
}

function DashboardAction({ label, sub, icon, link }: any) {
  return (
    <Link href={link} className="flex items-center justify-between p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-white group-hover:text-brand-yellow transition-colors">{label}</p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{sub}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
    </Link>
  );
}

function PulseMetric({ label, value, target, color }: any) {
  const colors: any = {
    blue: "bg-blue-500",
    teal: "bg-teal-500",
    orange: "bg-orange-500"
  };
  const percentage = Math.min(((value || 0) / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-gray-900">
          {typeof value === 'number' && isNaN(value) ? 0 : value} <span className="text-gray-300">/ {target}</span>
        </p>
      </div>
      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
