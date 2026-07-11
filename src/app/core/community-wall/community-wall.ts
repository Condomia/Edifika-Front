import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BUILDING_RULES_SECTIONS } from '../../shared/constants/building-rules-content';

interface Post {
  id: number;
  title: string;
  content: string;
  residentId: number;
  imageUrl?: string;
  createdAt: string;
}

interface User { id: number; fullName: string; }

interface PageResponse<T> {
  content: T[];
}

interface EnrichedPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorUnit: string;
  authorAvatar: string;
  timeAgo: string;
  isAnnouncement: boolean;
  hasAttachedImage: boolean;
  attachedImageUrl: string;
}

@Component({
  selector: 'app-community-wall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-wall.html',
  styleUrl: './community-wall.css'
})
export class CommunityWall implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = environment.serverBaseUrl;

  posts: EnrichedPost[] = [];

  newPostContent: string = '';
  newPostImageBase64: string | null = null;
  isSubmitting: boolean = false;
  showRulesModal = false;
  readonly buildingRulesSections = BUILDING_RULES_SECTIONS;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    Promise.all([
      this.http.get<PageResponse<Post>>(`${this.baseUrl}/posts`).toPromise(),
      this.http.get<User[]>(`${this.baseUrl}/users`).toPromise()
    ]).then(([postsPage, users = []]) => {
      const rawPosts = postsPage?.content ?? [];

      const sortedPosts = rawPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.posts = sortedPosts.map(p => {
        const user = users.find(u => u.id === p.residentId);

        const isAnnouncement = p.title.toLowerCase().includes('mantenimiento') || p.title.toLowerCase().includes('official');

        let authorName = user ? user.fullName : 'Unknown Resident';
        let authorAvatar = p.imageUrl || 'https://i.pravatar.cc/150?u=default';
        let authorUnit = 'Resident';

        if (isAnnouncement) {
          authorName = 'Edifika Management';
          authorAvatar = ''; // use icon in template
        }

        return {
          id: p.id,
          title: p.title,
          content: p.content,
          authorName: authorName,
          authorUnit: authorUnit,
          authorAvatar: authorAvatar,
          timeAgo: this.getTimeAgo(p.createdAt),
          isAnnouncement: isAnnouncement,
          hasAttachedImage: !!p.imageUrl || isAnnouncement,
          attachedImageUrl: p.imageUrl || (isAnnouncement ? 'https://images.unsplash.com/photo-1576013551627-11971f36c9d0?auto=format&fit=crop&w=800&q=80' : '')
        };
      });
    });
  }

  getTimeAgo(dateString: string): string {
    const past = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins || 1} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  openRulesModal(): void {
    this.showRulesModal = true;
  }

  closeRulesModal(): void {
    this.showRulesModal = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newPostImageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.newPostImageBase64 = null;
  }

  submitPost() {
    if (!this.newPostContent.trim() && !this.newPostImageBase64) return;

    this.isSubmitting = true;

    const newPost = {
      title: 'New Update',
      content: this.newPostContent,
      residentId: this.getCurrentUserId(),
      imageUrl: this.newPostImageBase64 || ''
    };

    this.http.post(`${this.baseUrl}/posts`, newPost).subscribe({
      next: () => {
        this.newPostContent = '';
        this.newPostImageBase64 = null;
        this.isSubmitting = false;
        this.fetchData();
      },
      error: () => {
        this.isSubmitting = false;
        alert('Error creating post');
      }
    });
  }

  private getCurrentUserId(): number {
    const currentUser = localStorage.getItem('edifika_user');

    if (!currentUser) {
      return 0;
    }

    return Number(JSON.parse(currentUser).id ?? 0);
  }
}
