"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client"; 

export default function CreateEvent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); 

  // Protect this route: Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Show a loading skeleton/spinner while checking auth state[cite: 7]
  if (isPending || !session) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    
    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const type = form.eventType.value;
    const image = form.image.value;
    const location = form.location.value;
    const date = form.date.value;

    // Validation: Ensure the selected date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (selectedDate <= today) {
      setToast({ type: "error", message: "Event date must be in the future." });
      return;
    }

    setLoading(true);

    // Prepare data to send to the backend, including the required user email
    const eventData = {
      title,
      description,
      type,
      image,
      location,
      date,
      userEmail: session.user.email, // Required for ownership validation later[cite: 4]
      userName: session.user.name,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        // Show success message and redirect[cite: 4]
        setToast({ type: "success", message: "Event created successfully!" });
        form.reset();
        setTimeout(() => {
          router.push("/upcoming-events"); 
        }, 2000);
      } else {
        setToast({ type: "error", message: "Failed to save the event." });
      }
    } catch (error) {
      setToast({ type: "error", message: "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-base-200 py-10 px-4 relative">
      
      {/* Custom UI Toasts for Error/Success Messages[cite: 1, 4] */}
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === "error" ? "alert-error" : "alert-success text-white"}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="btn btn-xs btn-circle btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">Create New Event</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Event Title</span></label>
              <input type="text" name="title" placeholder="e.g., Winter Clothes Distribution" className="input input-bordered w-full" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Event Type</span></label>
                <select name="eventType" className="select select-bordered w-full" required defaultValue="">
                  <option value="" disabled>Select a category</option>
                  <option value="Cleanup">Cleanup</option>
                  <option value="Plantation">Plantation</option>
                  <option value="Donation">Donation</option>
                  <option value="Health Camp">Health Camp</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Event Date</span></label>
                <input type="date" name="date" className="input input-bordered w-full" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Location</span></label>
                <input type="text" name="location" placeholder="e.g., Mirpur 10, Dhaka" className="input input-bordered w-full" required />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Thumbnail Image URL</span></label>
                <input type="url" name="image" placeholder="https://example.com/image.jpg" className="input input-bordered w-full" required />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Description</span></label>
              <textarea name="description" placeholder="Describe the event, who can join, and what to bring..." className="textarea textarea-bordered h-24 w-full" required></textarea>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}