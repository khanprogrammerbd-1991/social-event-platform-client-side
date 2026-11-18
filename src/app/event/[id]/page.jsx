"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "../../../lib/auth-client"; 

function EventDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSingleEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchSingleEvent();
  }, [params.id]);

  const handleJoinEvent = async () => {
    if (!session) {
      setToast({ type: "error", message: "You must be logged in to join an event." });
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setJoining(true);
    setToast(null);

    const joinData = {
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      eventImage: event.image,
      participantEmail: session.user.email,
      participantName: session.user.name,
      joinedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinData),
      });

      if (res.ok) {
        setToast({ type: "success", message: "Successfully joined the event!" });
      } else {
        setToast({ type: "error", message: "Failed to join event." });
      }
    } catch (error) {
      setToast({ type: "error", message: "Network error occurred." });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-20 text-2xl">Event not found</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-base-200 py-10 px-4 relative">
      
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === "error" ? "alert-error" : "alert-success text-white"}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="btn btn-xs btn-circle btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto card bg-base-100 shadow-xl overflow-hidden">
        <figure className="h-96 w-full">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        </figure>
        
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <div className="badge badge-secondary mb-3">{event.type}</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-lg text-gray-600">
              <span>📅</span> <strong>Date:</strong> {event.date}
            </div>
            <div className="flex items-center gap-3 text-lg text-gray-600">
              <span>📍</span> <strong>Location:</strong> {event.location}
            </div>
            <div className="flex items-center gap-3 text-lg text-gray-600">
              <span>👤</span> <strong>Organizer:</strong> {event.userName}
            </div>
          </div>

          <div className="divider"></div>
          
          <h3 className="text-xl font-semibold mb-2">About this event</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
            {event.description}
          </p>

          <div className="card-actions justify-end mt-4">
            <button 
              onClick={handleJoinEvent} 
              className="btn btn-primary px-8 text-lg"
              disabled={joining}
            >
              {joining ? "Joining..." : "Join Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// NEW: Wrap the content in a Suspense boundary to fix the build error
export default function EventDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    }>
      <EventDetailsContent />
    </Suspense>
  );
}