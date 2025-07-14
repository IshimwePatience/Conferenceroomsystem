package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.search.GlobalSearchRequestDto;
import Room.ConferenceRoomMgtsys.dto.search.GlobalSearchResultDto;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.Booking;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GlobalSearchService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public GlobalSearchResultDto search(GlobalSearchRequestDto request) {
        Pageable pageRequest = PageRequest.of(
                request.getPage(),
                request.getSize(),
                Sort.Direction.fromString(request.getSortOrder().toUpperCase()),
                request.getSortField());

        List<Map<String, Object>> results = new ArrayList<>();
        long totalResults = 0;

        // Search across all repositories
        if (request.getType() == null || "room".equalsIgnoreCase(request.getType())) {
            Page<Room> rooms = roomRepository.search(request.getQuery(), pageRequest);
            totalResults += rooms.getTotalElements();
            rooms.forEach(room -> results.add(mapToResult("room", room)));
        }

        if (request.getType() == null || "booking".equalsIgnoreCase(request.getType())) {
            Page<Booking> bookings = bookingRepository.search(request.getQuery(), pageRequest);
            totalResults += bookings.getTotalElements();
            bookings.forEach(booking -> results.add(mapToResult("booking", booking)));
        }

        if (request.getType() == null || "user".equalsIgnoreCase(request.getType())) {
            Page<User> users = userRepository.search(request.getQuery(), pageRequest);
            totalResults += users.getTotalElements();
            users.forEach(user -> results.add(mapToResult("user", user)));
        }

        return new GlobalSearchResultDto(
                totalResults,
                (int) Math.ceil((double) totalResults / request.getSize()),
                request.getPage(),
                request.getSize(),
                results);
    }

    private Map<String, Object> mapToResult(String entityType, Object entity) {
        Map<String, Object> result = new HashMap<>();
        result.put("type", entityType);
        result.put("id", "id".equals(entityType) ? entity : null);
        result.put("name", "name".equals(entityType) ? entity : null);
        return result;
    }
}
