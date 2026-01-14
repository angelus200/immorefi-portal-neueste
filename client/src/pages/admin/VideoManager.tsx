import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Video as VideoIcon, ExternalLink, ChevronUp, ChevronDown, Play } from "lucide-react";

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Generate YouTube thumbnail URL from video ID
function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return "";
}

export default function VideoManager() {
  const utils = trpc.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    thumbnailUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data: allVideos = [], isLoading } = trpc.video.listAll.useQuery();

  const createMutation = trpc.video.create.useMutation({
    onSuccess: () => {
      toast.success("Video erfolgreich erstellt");
      utils.video.listAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.video.update.useMutation({
    onSuccess: () => {
      toast.success("Video erfolgreich aktualisiert");
      utils.video.listAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.video.delete.useMutation({
    onSuccess: () => {
      toast.success("Video erfolgreich gelöscht");
      utils.video.listAll.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const reorderMutation = trpc.video.reorder.useMutation({
    onSuccess: () => {
      toast.success("Reihenfolge aktualisiert");
      utils.video.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleOpenDialog = (video?: any) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || "",
        youtubeUrl: video.youtubeUrl,
        thumbnailUrl: video.thumbnailUrl || "",
        sortOrder: video.sortOrder,
        isActive: video.isActive,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        youtubeUrl: "",
        thumbnailUrl: "",
        sortOrder: allVideos.length,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      youtubeUrl: "",
      thumbnailUrl: "",
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate thumbnail if not provided
    const thumbnail = formData.thumbnailUrl || getYouTubeThumbnail(formData.youtubeUrl);

    if (editingVideo) {
      updateMutation.mutate({
        id: editingVideo.id,
        ...formData,
        thumbnailUrl: thumbnail,
      });
    } else {
      createMutation.mutate({
        ...formData,
        thumbnailUrl: thumbnail,
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === allVideos.length - 1) return;

    const newVideos = [...allVideos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap
    [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];

    // Update sortOrder for all affected videos
    const updates = newVideos.map((video, idx) => ({
      id: video.id,
      sortOrder: idx,
    }));

    reorderMutation.mutate({ updates });
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      youtubeUrl: url,
      thumbnailUrl: getYouTubeThumbnail(url) || prev.thumbnailUrl,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Video-Verwaltung</h1>
            <p className="text-muted-foreground mt-2">
              Verwalten Sie YouTube-Videos für die Startseite
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Video hinzufügen
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alle Videos ({allVideos.length})</CardTitle>
            <CardDescription>
              Videos werden in der angegebenen Reihenfolge auf der Startseite angezeigt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Lädt...</div>
            ) : allVideos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <VideoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Videos vorhanden</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pos.</TableHead>
                    <TableHead className="w-32">Vorschau</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>YouTube-URL</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allVideos.map((video, index) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === allVideos.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative w-24 h-16 bg-slate-100 rounded overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <VideoIcon className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{video.title}</div>
                          {video.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {video.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          YouTube
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={video.isActive ? "default" : "secondary"}>
                          {video.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(video)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {deleteConfirmId === video.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(video.id)}
                              >
                                Bestätigen
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Abbrechen
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(video.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Video bearbeiten" : "Neues Video hinzufügen"}
              </DialogTitle>
              <DialogDescription>
                Fügen Sie YouTube-Videos hinzu, die auf der Startseite angezeigt werden sollen
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube-URL *</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Fügen Sie die vollständige YouTube-URL ein
                  </p>
                </div>

                {formData.thumbnailUrl && (
                  <div className="space-y-2">
                    <Label>Vorschau</Label>
                    <div className="relative w-full h-48 bg-slate-100 rounded overflow-hidden">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Vorschau"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Video-Titel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurze Beschreibung des Videos (optional)"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Video ist aktiv und wird angezeigt
                  </Label>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingVideo ? "Aktualisieren" : "Erstellen"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
