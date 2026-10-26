interface LogParams {
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
}

export const logActivity = async (params: LogParams) => {
  try {
    await fetch("/api/log_activity.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: params.userId,
        user_name: params.userName,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        details: params.details,
      }),
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};
