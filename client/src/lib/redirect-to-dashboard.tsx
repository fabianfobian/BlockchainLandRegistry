import { UserRole } from "@shared/schema";

export function redirectToDashboard(role: UserRole, navigate: (path: string) => void): void {
  switch (role) {
    case UserRole.LANDOWNER:
      navigate("/dashboard/landowner");
      break;
    case UserRole.BUYER:
      navigate("/dashboard/buyer");
      break;
    case UserRole.VERIFIER:
      navigate("/dashboard/verifier");
      break;
    case UserRole.ADMIN:
      navigate("/dashboard/admin");
      break;
    default:
      navigate("/auth");
  }
}
