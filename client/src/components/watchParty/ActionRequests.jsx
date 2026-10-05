import React from "react";

const ActionRequests = ({
  isHost,
  actionRequests,
  approveRequest,
  rejectRequest,
}) => {
  if (!isHost || actionRequests.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 w-[calc(100vw-1rem)] max-w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-2 sm:p-2.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-xs">Action Requests</h3>

        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
          {actionRequests.length}
        </span>
      </div>

      <div className="space-y-1.5 max-h-48 sm:max-h-64 overflow-y-auto">
        {actionRequests.map((request) => (
          <div key={request.requestId} className="border rounded-lg p-2">
            <p className="text-xs font-medium truncate">{request.username}</p>

            <p className="text-[10px] text-slate-500 mt-1">
              Requested:{" "}
              <span className="font-medium">
                {request.action.replace("_", " ")}
              </span>
            </p>

            {request.action === "change_video" && request.data?.videoId && (
              <p className="text-[10px] text-slate-500 mt-1 break-all">
                Video ID: {request.data.videoId}
              </p>
            )}

            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => approveRequest(request)}
                className="flex-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer hover:bg-emerald-100"
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => rejectRequest(request)}
                className="flex-1 bg-red-50 text-red-500 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer hover:bg-red-100"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionRequests;
