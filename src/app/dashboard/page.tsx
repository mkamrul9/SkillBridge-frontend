"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-url";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    
    // Fetch user profile
    fetch(`${apiUrl}/api/user/me`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          setProfile(null);
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          if (data.data.tutorProfile) {
            setBio(data.data.tutorProfile.bio || "");
            setAvailability(data.data.tutorProfile.availability || "");
            
            // Set selected categories
            if (data.data.tutorProfile.categories) {
              setSelectedCategoryIds(data.data.tutorProfile.categories.map((c: any) => c.id));
            }
            
            // Calculate average rating
            if (data.data.tutorProfile.reviews && data.data.tutorProfile.reviews.length > 0) {
              const total = data.data.tutorProfile.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
              setAverageRating(total / data.data.tutorProfile.reviews.length);
            }
          }
        } else {
          toast.error("Failed to load dashboard");
        }
        setLoading(false);
      });
    
    // Fetch all categories
    fetch(`${apiUrl}/api/categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
        }
      })
      .catch(() => console.error("Failed to load categories"));
  }, [router]);

  const handleUpdateTutorProfile = async () => {
    const apiUrl = getApiBaseUrl();
    const url = apiUrl.endsWith("/api") ? `${apiUrl}/tutors/profile` : `${apiUrl}/api/tutors/profile`;
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bio,
        availability,
        categoryIds: selectedCategoryIds,
      }),
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success("Profile updated successfully");
      setEditing(false);
      // Refresh profile
      const refreshRes = await fetch(`${apiUrl}/api/user/me`, { credentials: "include" });
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        setProfile(refreshData.data);
        // Update all state with refreshed data
        if (refreshData.data.tutorProfile) {
          setBio(refreshData.data.tutorProfile.bio || "");
          setAvailability(refreshData.data.tutorProfile.availability || "");
          if (refreshData.data.tutorProfile.categories) {
            setSelectedCategoryIds(refreshData.data.tutorProfile.categories.map((c: any) => c.id));
          }
        }
      }
    } else {
      toast.error(data.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="sb-page">
      <main>
        <div className="sb-container space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:mr-4 sm:w-auto">Back</Button>
            <h1 className="sb-title text-center sm:text-left">Dashboard</h1>
            <Link href="/profile/edit" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Edit Profile</Button>
            </Link>
          </div>

          {profile && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile</CardTitle>
                  {profile.role === "TUTOR" && !editing && (
                    <Button size="sm" onClick={() => setEditing(true)}>Edit Bio</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{profile.role?.toLowerCase()}</p>
                  </div>
                  {profile.role === "TUTOR" && profile.tutorProfile && averageRating !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="font-medium">{averageRating.toFixed(1)} ⭐ ({profile.tutorProfile.reviews?.length || 0} reviews)</p>
                    </div>
                  )}
                  {profile.role === "TUTOR" && profile.tutorProfile && (
                    <>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Bio</p>
                        {editing ? (
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full rounded-md border px-3 py-2"
                            rows={3}
                          />
                        ) : (
                          <p className="font-medium">{profile.tutorProfile.bio}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Availability</p>
                        {editing ? (
                          <>
                            <textarea
                              value={availability}
                              onChange={(e) => setAvailability(e.target.value)}
                              className="w-full rounded-md border px-3 py-2"
                              rows={2}
                              placeholder="e.g., Mon-Fri 9AM-5PM, Weekends 10AM-2PM"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Describe your available hours</p>
                          </>
                        ) : (
                          <p className="font-medium">{profile.tutorProfile.availability || "Not set"}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Categories</p>
                        {editing ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {categories.map((category) => (
                                <label
                                  key={category.id}
                                  className={`cursor-pointer rounded-full px-4 py-2 text-sm border transition-colors ${
                                    selectedCategoryIds.includes(category.id)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background hover:bg-muted border-input"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedCategoryIds.includes(category.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                                      } else {
                                        setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id));
                                      }
                                    }}
                                  />
                                  {category.name}
                                </label>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Select categories that match your expertise</p>
                          </>
                        ) : (
                          <p className="font-medium">
                            {profile.tutorProfile.categories && profile.tutorProfile.categories.length > 0
                              ? profile.tutorProfile.categories.map((c: any) => c.name).join(", ")
                              : "No categories selected"}
                          </p>
                        )}
                      </div>
                      {editing && (
                        <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row">
                          <Button onClick={handleUpdateTutorProfile} className="w-full sm:w-auto">Save Changes</Button>
                          <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                            setEditing(false);
                            setBio(profile.tutorProfile.bio || "");
                            setAvailability(profile.tutorProfile.availability || "");
                            setSelectedCategoryIds(profile.tutorProfile.categories?.map((c: any) => c.id) || []);
                          }}>Cancel</Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {(profile && profile.role === "STUDENT") && (
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{booking.tutor?.user?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm capitalize">
                            {booking.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* ...existing code... */}
        </div>
      </main>
    </div>
  );
 

}
