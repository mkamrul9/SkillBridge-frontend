"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-url";
import { Skeleton } from "@/components/ui/skeleton";

function TutorsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-56" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={`filter-skeleton-${idx}`} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-5 w-48" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 9 }).map((_, idx) => (
            <Card key={`tutor-skeleton-${idx}`} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  useEffect(() => {
    const base = getApiBaseUrl();

    // Fetch categories
    fetch(`${base}/api/categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => console.error("Failed to load categories"));

    // Fetch all tutors initially
    fetchTutors({}, 1);
  }, []);

  const fetchTutors = (filters = {}, page = 1) => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api") ? `${base}/tutors` : `${base}/api/tutors`;

    // Build query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });

    params.append("page", page.toString());
    params.append("limit", "9");

    const fetchUrl = `${url}?${params.toString()}`;

    fetch(fetchUrl, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTutors(data.data);
          setCurrentPage(data.pagination?.page || page);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalResults(data.pagination?.total || data.data.length || 0);
        } else {
          toast.error("Failed to load tutors");
        }
      })
      .catch(() => toast.error("Failed to load tutors"))
      .finally(() => setLoading(false));
  };

  const getCurrentFilters = () => {
    const filters: any = {};
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (selectedCategory && selectedCategory !== 'all') filters.categoryId = selectedCategory;
    if (minRating && minRating !== 'all') filters.minRating = minRating;
    if (minPrice) filters.minRate = minPrice;
    if (maxPrice) filters.maxRate = maxPrice;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    return filters;
  };

  const handleApplyFilters = () => {
    const filters = getCurrentFilters();

    setLoading(true);
    fetchTutors(filters, 1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setLoading(true);
    fetchTutors(getCurrentFilters(), page);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMinRating("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSortOrder("desc");
    setLoading(true);
    fetchTutors({}, 1);
  };

  if (loading) return <TutorsPageSkeleton />;

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          className="mb-4 px-4 py-2 border rounded text-sm hover:bg-muted"
          type="button"
          onClick={() => window.history.back()}
        >
          Back
        </button>

        <h1 className="text-3xl font-bold">Find a Tutor</h1>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  type="text"
                  placeholder="Search by tutor name, email, or bio"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                    <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                    <SelectItem value="3.5">3.5+ ⭐</SelectItem>
                    <SelectItem value="3.0">3.0+ ⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Price ($/hr)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  step="5"
                />
              </div>

              {/* Max Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Price ($/hr)</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  step="5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-end gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Found {totalResults} tutor{totalResults !== 1 ? "s" : ""}
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tutors.map((tutor) => {
            const avgRating = tutor.reviews?.length
              ? (tutor.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tutor.reviews.length).toFixed(1)
              : "N/A";

            return (
              <Card key={tutor.id} className="flex h-full flex-col transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{tutor.user.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{tutor.bio || "No bio"}</p>
                    {tutor.categories && tutor.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tutor.categories.slice(0, 2).map((cat: any) => (
                          <span key={cat.id} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                            {cat.name}
                          </span>
                        ))}
                        {tutor.categories.length > 2 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{tutor.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${tutor.hourlyRate}/hr</span>
                      <span>⭐ {avgRating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tutor.experience} years exp</p>
                  </div>

                  <Link href={`/tutors/${tutor.id}`} className="mt-4">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tutors.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No tutors found for the selected filters.
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
