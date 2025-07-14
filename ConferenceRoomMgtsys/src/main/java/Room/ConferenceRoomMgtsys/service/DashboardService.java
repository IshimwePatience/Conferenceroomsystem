package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.model.User;

public interface DashboardService {
    Object getSystemAdminDashboard();
    Object getAdminDashboard(User admin);
    Object getUserDashboard(User user);
}