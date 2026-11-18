"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import Link from "next/link";

export default function ManageEvents() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // NEW: States for the Edit Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user?.email) return;

    let cancelled = false;

    const loadEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-events/${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setMyEvents(data);
        }
      } catch (error) {
        console.error("Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this event?");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ type: "success", message: "Event deleted successfully!" });
        setMyEvents(myEvents.filter((event) => event._id !== id));
      } else {
        setToast({ type: "error", message: "Failed to delete event." });
      }
    } catch (error) {
      setToast({ type: "error", message: "Network error occurred." });
    }
  };

  // NEW: Function to open the modal and load the specific event's data
  const openEditModal = (event) => {
    setSelectedEvent(event);
    document.getElementById("edit_modal").showModal();
  };

  // NEW: Function to handle the form submission for updating
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const form = e.target;
    const updatedEventData = {
      title: form.title.value,
      type: form.eventType.value,
      location: form.location.value,
      image: form.image.value,
      date: form.date.value,
      description: form.description.value,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${selectedEvent._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEventData),
      });

      if (res.ok) {
        setToast({ type: "success", message: "Event updated successfully!" });
        document.getElementById("edit_modal").close();
        
        // Update the UI table instantly without reloading the page
        setMyEvents(myEvents.map(evt => 
          evt._id === selectedEvent._id ? { ...evt, ...updatedEventData } : evt
        ));
      } else {
        setToast({ type: "error", message: "Failed to update event." });
      }
    } catch (error) {
      setToast({ type: "error", message: "Network error occurred." });
    } finally {
      setUpdating(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 md:px-8 relative">
      
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === "error" ? "alert-error" : "alert-success text-white"}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="btn btn-xs btn-circle btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Manage My Events</h1>
          <p className="text-gray-600">Update or delete events you have created.</p>
        </div>

        {myEvents.length === 0 ? (
          <div className="text-center py-20 bg-base-100 rounded-box shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-500">You haven&apos;t created any events yet.</h2>
            <Link href="/create-event" className="btn btn-primary mt-6">Create New Event</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
            <table className="table w-full">
              <thead className="bg-base-200 text-base-content text-sm">
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => (
                  <tr key={event._id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={event.image} alt={event.title} />
                          </div>
                        </div>
                        <div className="font-bold">{event.title}</div>
                      </div>
                    </td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>
                      <div className="flex justify-center gap-2">
                        {/* UPDATE: Edit button now triggers the modal */}
                        <button 
                          onClick={() => openEditModal(event)} 
                          className="btn btn-info btn-sm text-white"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)} 
                          className="btn btn-error btn-sm text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW: DaisyUI Edit Modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-2xl mb-4">Edit Event</h3>
          
          {/* We only render the form if selectedEvent has data */}
          {selectedEvent && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Event Title</span></label>
                <input type="text" name="title" defaultValue={selectedEvent.title} className="input input-bordered w-full" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Event Type</span></label>
                  <select name="eventType" defaultValue={selectedEvent.type} className="select select-bordered w-full" required>
                    <option value="Cleanup">Cleanup</option>
                    <option value="Plantation">Plantation</option>
                    <option value="Donation">Donation</option>
                    <option value="Health Camp">Health Camp</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Event Date</span></label>
                  <input type="date" name="date" defaultValue={selectedEvent.date} className="input input-bordered w-full" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Location</span></label>
                  <input type="text" name="location" defaultValue={selectedEvent.location} className="input input-bordered w-full" required />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold">Image URL</span></label>
                  <input type="url" name="image" defaultValue={selectedEvent.image} className="input input-bordered w-full" required />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Description</span></label>
                <textarea name="description" defaultValue={selectedEvent.description} className="textarea textarea-bordered h-24 w-full" required></textarea>
              </div>

              <div className="modal-action mt-6 flex gap-2">
                <button type="button" className="btn" onClick={() => document.getElementById("edit_modal").close()}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}