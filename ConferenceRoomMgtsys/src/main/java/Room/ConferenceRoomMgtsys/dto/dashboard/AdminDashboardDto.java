package Room.ConferenceRoomMgtsys.dto.dashboard;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalUsers;
    private long totalRooms;
    private long totalBookingsToday;
    private long totalBookingsThisMonth;
    private long pendingBookings;
    private long activeBookings;
    private double averageRoomUtilization;
    private List<PopularRoomDto> mostPopularRooms;
    private List<BookingTrendDto> bookingTrends;
    private Map<String, Long> bookingsByStatus;
    private LocalDateTime lastUpdated;

    public AdminDashboardDto() {}

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalBookingsToday() {
        return totalBookingsToday;
    }

    public void setTotalBookingsToday(long totalBookingsToday) {
        this.totalBookingsToday = totalBookingsToday;
    }

    public long getTotalBookingsThisMonth() {
        return totalBookingsThisMonth;
    }

    public void setTotalBookingsThisMonth(long totalBookingsThisMonth) {
        this.totalBookingsThisMonth = totalBookingsThisMonth;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public double getAverageRoomUtilization() {
        return averageRoomUtilization;
    }

    public void setAverageRoomUtilization(double averageRoomUtilization) {
        this.averageRoomUtilization = averageRoomUtilization;
    }

    public List<PopularRoomDto> getMostPopularRooms() {
        return mostPopularRooms;
    }

    public void setMostPopularRooms(List<PopularRoomDto> mostPopularRooms) {
        this.mostPopularRooms = mostPopularRooms;
    }

    public List<BookingTrendDto> getBookingTrends() {
        return bookingTrends;
    }

    public void setBookingTrends(List<BookingTrendDto> bookingTrends) {
        this.bookingTrends = bookingTrends;
    }

    public Map<String, Long> getBookingsByStatus() {
        return bookingsByStatus;
    }

    public void setBookingsByStatus(Map<String, Long> bookingsByStatus) {
        this.bookingsByStatus = bookingsByStatus;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}