package Room.ConferenceRoomMgtsys.dto.admin.view;

public class AdminDashboardViewDto {
    private String totalUsers;
    private String totalRooms;
    private String todayBookings;
    private String monthlyBookings;
    private String pendingRequests;
    private String activeBookings;
    private String roomUtilization; // "75% average utilization"
    private String busyDay; // "Wednesday is busiest"
    private String topRoom; // "Conference Room A is most popular"
    private String lastUpdated; // "Updated 5 minutes ago"

    public AdminDashboardViewDto() {}

    // Getters and Setters
    public String getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(String totalUsers) {
        this.totalUsers = totalUsers;
    }

    public String getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(String totalRooms) {
        this.totalRooms = totalRooms;
    }

    public String getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(String todayBookings) {
        this.todayBookings = todayBookings;
    }

    public String getMonthlyBookings() {
        return monthlyBookings;
    }

    public void setMonthlyBookings(String monthlyBookings) {
        this.monthlyBookings = monthlyBookings;
    }

    public String getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(String pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public String getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(String activeBookings) {
        this.activeBookings = activeBookings;
    }

    public String getRoomUtilization() {
        return roomUtilization;
    }

    public void setRoomUtilization(String roomUtilization) {
        this.roomUtilization = roomUtilization;
    }

    public String getBusyDay() {
        return busyDay;
    }

    public void setBusyDay(String busyDay) {
        this.busyDay = busyDay;
    }

    public String getTopRoom() {
        return topRoom;
    }

    public void setTopRoom(String topRoom) {
        this.topRoom = topRoom;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

