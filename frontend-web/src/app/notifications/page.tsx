import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "approved",
      title: "Story Approved!",
      message: "Your story 'The Road to State' has been approved and is now live on the platform.",
      date: "2 hours ago",
      read: false,
      link: "/stories/1"
    },
    {
      id: 2,
      type: "rejected",
      title: "Story Needs Revisions",
      message: "Your story 'Why I Changed My Stance' was not approved. Please ensure your images meet our quality guidelines and resubmit.",
      date: "2 days ago",
      read: true,
      link: "/stories/4/edit"
    },
    {
      id: 3,
      type: "pending",
      title: "Story Submitted",
      message: "Your story 'Training Camp: A New Perspective' is under review by our admin team.",
      date: "1 week ago",
      read: true,
      link: "/dashboard/stories"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "approved": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending": return <Clock className="w-5 h-5 text-brand-yellow" />;
      default: return <Bell className="w-5 h-5 text-gray-900" />;
    }
  };

  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      <div className="container mx-auto px-4 mt-12 max-w-3xl">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Notifications</h1>
          </div>
          <button className="text-sm font-bold text-muted hover:text-gray-900 transition-colors">
            Mark all as read
          </button>
        </div>

        <div className="bg-surface border border-gray-100 rounded-3xl overflow-hidden divide-y divide-surface-hover">
          {notifications.map((notification) => (
            <Link 
              href={notification.link} 
              key={notification.id} 
              className={`flex items-start gap-4 p-6 hover:bg-surface-hover/50 transition-colors ${!notification.read ? 'bg-surface-hover/20' : ''}`}
            >
              <div className="mt-1 shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className={`font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs font-bold text-muted whitespace-nowrap">
                    {notification.date}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-brand-yellow shrink-0 mt-2"></div>
              )}
            </Link>
          ))}

          {notifications.length === 0 && (
            <div className="p-12 text-center text-muted flex flex-col items-center">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>You have no notifications right now.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
