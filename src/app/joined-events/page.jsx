"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import Link from "next/link";

export default function JoinedEvents() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect Route: Redirect if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchMyJoinedEvents = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/joined-events/${session.user.email}`);
          if (res.ok) {
            const data = await res.json();
            setJoinedEvents(data);
          }
        } catch (error) {
          console.error("Failed to load joined events");
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchMyJoinedEvents();
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">My Joined Events</h1>
          <p className="text-gray-600">Events you have committed to attending.</p>
        </div>

        {joinedEvents.length === 0 ? (
          <div className="text-center py-20 bg-base-100 rounded-box shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-500">You haven&apos;t joined any events yet.</h2>
            <Link href="/upcoming-events" className="btn btn-primary mt-6">Explore Events</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
            <table className="table w-full">
              {/* Table Head */}
              <thead className="bg-base-200 text-base-content text-sm">
                <tr>
                  <th>Event</th>
                  <th>Location</th>
                  <th>Event Date</th>
                  <th>Joined On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {joinedEvents.map((event) => (
                  <tr key={event._id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={event.eventImage} alt="Event Thumbnail" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{event.eventTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td>{event.eventLocation}</td>
                    <td>
                      <span className="badge badge-ghost badge-sm">{event.eventDate}</span>
                    </td>
                    <td>{new Date(event.joinedAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/event/${event.eventId}`} className="btn btn-ghost btn-xs">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}