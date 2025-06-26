
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Video, Image, Download, Search, Filter } from 'lucide-react';

interface ContentLibraryProps {
  gymId: string;
  userRole: string;
  userId: string;
}

const ContentLibrary = ({ gymId, userRole, userId }: ContentLibraryProps) => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    content_type: 'document' as 'video' | 'pdf' | 'image' | 'document',
    is_public: false,
    tags: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, [gymId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select(`
          *,
          profiles:created_by (first_name, last_name)
        `)
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content library',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${gymId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gym-content')
        .getPublicUrl(filePath);

      // Create content record
      const { error: insertError } = await supabase
        .from('content_library')
        .insert({
          gym_id: gymId,
          created_by: userId,
          title: newContent.title || file.name,
          description: newContent.description,
          content_type: newContent.content_type,
          file_url: publicUrl,
          is_public: newContent.is_public,
          tags: newContent.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Content uploaded successfully',
      });

      setShowUploadDialog(false);
      setNewContent({
        title: '',
        description: '',
        content_type: 'document',
        is_public: false,
        tags: ''
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'image': return 'bg-green-500';
      case 'pdf': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.content_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const canUpload = userRole === 'gym_admin' || userRole === 'trainer';

  if (loading) {
    return <div className="flex justify-center p-8 text-white">Loading content library...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Library</h2>
          <p className="text-purple-200">Manage training videos, documents, and resources</p>
        </div>
        
        {canUpload && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">Upload New Content</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Content title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Input
                    id="description"
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Content description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_type" className="text-white">Content Type</Label>
                  <Select 
                    value={newContent.content_type} 
                    onValueChange={(value: 'video' | 'pdf' | 'image' | 'document') => 
                      setNewContent({...newContent, content_type: value})
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newContent.tags}
                    onChange={(e) => setNewContent({...newContent, tags: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="workout, beginner, cardio"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file" className="text-white">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={uploading}
                  />
                </div>
                
                {uploading && (
                  <div className="text-center text-purple-300">Uploading...</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="bg-slate-800/90 border-purple-500/20 hover:border-purple-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getContentIcon(item.content_type)}
                  <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                </div>
                <Badge className={`${getContentTypeColor(item.content_type)} text-white`}>
                  {item.content_type}
                </Badge>
              </div>
              {item.description && (
                <CardDescription className="text-purple-200">{item.description}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-400/50 text-purple-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-purple-300">
                <span>
                  By {item.profiles?.first_name} {item.profiles?.last_name}
                </span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-purple-400/50 text-purple-300 hover:bg-purple-600/20"
                onClick={() => window.open(item.file_url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                View/Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card className="bg-slate-800/90 border-purple-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No content found</h3>
            <p className="text-purple-200 text-center">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria."
                : canUpload
                  ? "Start by uploading your first content item."
                  : "No content has been uploaded yet."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentLibrary;
