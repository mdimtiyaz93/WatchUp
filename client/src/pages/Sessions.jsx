import React from "react";
import { CalendarDaysIcon, ClockIcon, VideoIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Sessions = () => {
  const sessions = [
    {
      id: "wkb-wik-qym",
      title: "YouTube Watch Party",
      role: "Host",
      date: "Oct 4, 2026",
      time: "10:30 AM",
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your watch party sessions
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <VideoIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm text-slate-500 mt-3">No sessions found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <VideoIcon className="w-5 h-5" />
                  </div>

                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                    {session.status}
                  </span>
                </div>

                <h2 className="font-semibold text-slate-900 mt-4">
                  {session.title}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Room: {session.id}
                </p>

                <div className="flex flex-col gap-2 mt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {session.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {session.time}
                  </div>

                  <div className="text-xs">
                    Role:{" "}
                    <span className="font-medium text-slate-700">
                      {session.role}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/meeting/${session.id}`}
                  className="block text-center mt-5 bg-primary text-white text-xs font-medium py-2.5 rounded-lg hover:opacity-90"
                >
                  Join Again
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sessions;
