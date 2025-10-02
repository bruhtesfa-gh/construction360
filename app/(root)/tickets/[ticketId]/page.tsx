"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "../../../providers";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Edit,
  MessageCircle,
  Paperclip,
  History,
} from "lucide-react";
import type { TicketWithRelations } from "../../../../types/database";

interface TicketDetailData extends TicketWithRelations {
  status_name: string;
  status_type: string;
  category_name?: string;
  priority_name?: string;
  priority_level?: number;
  reporter_first_name: string;
  reporter_last_name: string;
  assignee_first_name?: string;
  assignee_last_name?: string;
  job_number?: string;
  community_code?: string;
}

interface TicketDetailPageProps {
  params: {
    ticketId: string;
  };
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const builderId = session?.user?.builderId || "";

  // Fetch ticket details
  const {
    data: ticket,
    isLoading,
    refetch,
  } = api.tickets.getById.useQuery(
    { builderId, ticketId },
    { enabled: !!builderId && !!ticketId }
  ) as {
    data: TicketDetailData | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Fetch ticket history
  const { data: history } = api.tickets.getHistory.useQuery(
    { builderId, ticketId },
    { enabled: !!builderId && !!ticketId }
  );

  // Fetch categories, priorities, statuses for editing
  const { data: categories } = api.tickets.getCategories.useQuery(
    { builderId },
    { enabled: !!builderId }
  );
  const { data: priorities } = api.tickets.getPriorities.useQuery(
    { builderId },
    { enabled: !!builderId }
  );
  const { data: statuses } = api.tickets.getStatuses.useQuery(
    { builderId },
    { enabled: !!builderId }
  );

  // Mutations
  const updateTicket = api.tickets.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
    },
  });

  const addComment = api.tickets.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setNewComment("");
      setIsInternal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ticket not found</h1>
          <p className="text-gray-600 mt-2">
            The ticket you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/tickets")}
            className="mt-4"
            variant="outline"
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateTicket = (updates: any) => {
    updateTicket.mutate({
      builderId,
      ticketId,
      ...updates,
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !session?.user?.id) return;

    addComment.mutate({
      builderId,
      ticketId,
      userId: session.user.id,
      commentText: newComment,
      isInternal,
    });
  };

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priorityLevel: number) => {
    if (priorityLevel >= 5) return "bg-red-100 text-red-800";
    if (priorityLevel >= 4) return "bg-orange-100 text-orange-800";
    if (priorityLevel >= 3) return "bg-yellow-100 text-yellow-800";
    if (priorityLevel >= 2) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/tickets")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {ticket.ticket_number}
              <Badge className={getStatusColor(ticket.status_type)}>
                {ticket.status_name}
              </Badge>
            </h1>
            <p className="text-xl text-muted-foreground mt-1">{ticket.title}</p>
          </div>
        </div>

        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.description ? (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Comments, Attachments, History */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="comments"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Comments ({ticket.comments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="attachments"
                    className="flex items-center gap-2"
                  >
                    <Paperclip className="h-4 w-4" />
                    Attachments ({ticket.attachments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    History ({history?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="p-6 space-y-4">
                  {/* Add Comment Form */}
                  <div className="space-y-3">
                    <Label htmlFor="comment">Add Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Write your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        <Label htmlFor="internal" className="text-sm">
                          Internal comment (staff only)
                        </Label>
                      </div>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addComment.isPending}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 border-t pt-4">
                    {ticket.comments?.map((comment: any) => (
                      <div
                        key={comment.comment_id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              {comment.first_name} {comment.last_name}
                            </span>
                            {comment.is_internal && (
                              <Badge variant="secondary" className="text-xs">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground italic">
                        No comments yet
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="p-6">
                  {ticket.attachments?.length ? (
                    <div className="space-y-2">
                      {ticket.attachments.map((attachment: any) => (
                        <div
                          key={attachment.attachment_id}
                          className="flex items-center space-x-3 p-2 border rounded"
                        >
                          <Paperclip className="h-4 w-4" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {attachment.file_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded by {attachment.first_name}{" "}
                              {attachment.last_name} on{" "}
                              {new Date(
                                attachment.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No attachments
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="history" className="p-6">
                  {history?.length ? (
                    <div className="space-y-3">
                      {history.map((entry: any) => (
                        <div
                          key={entry.history_id}
                          className="flex items-start space-x-3 p-3 border-l-2 border-gray-200"
                        >
                          <History className="h-4 w-4 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">
                                {entry.first_name} {entry.last_name}
                              </span>{" "}
                              {entry.change_description}
                            </p>
                            {entry.old_value && entry.new_value && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Changed from "{entry.old_value}" to "
                                {entry.new_value}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No history available
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Status
                </Label>
                {isEditing ? (
                  <Select
                    value={ticket.status_id}
                    onValueChange={(value: string) =>
                      handleUpdateTicket({ statusId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses?.map((status) => (
                        <SelectItem
                          key={status.status_id}
                          value={status.status_id}
                        >
                          {status.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(ticket.status_type)}>
                    {ticket.status_name}
                  </Badge>
                )}
              </div>

              {/* Priority */}
              {ticket.priority_name && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority
                  </Label>
                  <Badge
                    className={getPriorityColor(ticket.priority_level || 1)}
                  >
                    {ticket.priority_name}
                  </Badge>
                </div>
              )}

              {/* Category */}
              {ticket.category_name && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <Badge variant="outline">{ticket.category_name}</Badge>
                </div>
              )}

              {/* Reporter */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Reporter
                </Label>
                <p className="text-sm">
                  {ticket.reporter_first_name} {ticket.reporter_last_name}
                </p>
              </div>

              {/* Assignee */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Assignee
                </Label>
                <p className="text-sm">
                  {ticket.assignee_first_name && ticket.assignee_last_name ? (
                    `${ticket.assignee_first_name} ${ticket.assignee_last_name}`
                  ) : (
                    <span className="text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </p>
              </div>

              {/* Dates */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Created
                </Label>
                <p className="text-sm">
                  {new Date(ticket.reported_date).toLocaleString()}
                </p>
              </div>

              {ticket.due_date && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Due Date
                  </Label>
                  <p className="text-sm">
                    {new Date(ticket.due_date).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Time Tracking */}
              {(ticket.estimated_hours || ticket.actual_hours) && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Time Tracking
                  </Label>
                  <div className="text-sm space-y-1">
                    {ticket.estimated_hours && (
                      <p>Estimated: {ticket.estimated_hours}h</p>
                    )}
                    {ticket.actual_hours && (
                      <p>Actual: {ticket.actual_hours}h</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Items */}
          {(ticket.job_number || ticket.community_code) && (
            <Card>
              <CardHeader>
                <CardTitle>Related Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticket.job_number && (
                  <div>
                    <Label className="text-sm font-medium">Job</Label>
                    <p className="text-sm">{ticket.job_number}</p>
                  </div>
                )}
                {ticket.community_code && (
                  <div>
                    <Label className="text-sm font-medium">Community</Label>
                    <p className="text-sm">{ticket.community_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
