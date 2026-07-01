export interface CanvasViewer {
  user_id: string;
  can_edit: boolean;
  profiles: { email: string } | null;
}
