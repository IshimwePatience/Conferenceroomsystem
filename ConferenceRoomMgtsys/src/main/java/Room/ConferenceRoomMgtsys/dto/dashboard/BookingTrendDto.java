package Room.ConferenceRoomMgtsys.dto.dashboard;

import java.time.LocalDate;

public class BookingTrendDto {
    private LocalDate date;
    private long bookingCount;
    private long uniqueUsers;
    private double averageDuration;

    public BookingTrendDto() {}

    public BookingTrendDto(LocalDate date, long bookingCount, long uniqueUsers, double averageDuration) {
        this.date = date;
        this.bookingCount = bookingCount;
        this.uniqueUsers = uniqueUsers;
        this.averageDuration = averageDuration;
    }

    // Getters and Setters
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public long getUniqueUsers() {
        return uniqueUsers;
    }

    public void setUniqueUsers(long uniqueUsers) {
        this.uniqueUsers = uniqueUsers;
    }

    public double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(double averageDuration) {
        this.averageDuration = averageDuration;
    }
}

