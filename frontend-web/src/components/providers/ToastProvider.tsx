"use client";

import { Toaster, resolveValue, toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export default function ToastProvider() {
  return (
    <Toaster position="top-right">
      {(t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        
        let stripColor = 'bg-blue-500';
        let iconColor = 'text-blue-500';
        let Icon = Info;
        let title = 'Info';
        
        if (isSuccess) {
          stripColor = 'bg-green-500';
          iconColor = 'text-green-500';
          Icon = CheckCircle2;
          title = 'Success';
        } else if (isError) {
          stripColor = 'bg-red-500';
          iconColor = 'text-red-500';
          Icon = XCircle;
          title = 'Error';
        }

        return (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto flex border border-gray-100 overflow-hidden transition-all`}
          >
            {/* Color Strip */}
            <div className={`w-2 shrink-0 ${stripColor}`} />
            
            {/* Content */}
            <div className="flex-1 p-4 pl-3">
              <div className="flex items-start">
                <div className={`shrink-0 ${iconColor} mt-0.5`}>
                  <Icon className="w-5 h-5 fill-current text-white" style={{ strokeWidth: 1.5 }} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black text-gray-900">{title}</p>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {resolveValue(t.message, t)}
                  </p>
                </div>
                <div className="ml-4 shrink-0 flex">
                  <button
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Toaster>
  );
}
