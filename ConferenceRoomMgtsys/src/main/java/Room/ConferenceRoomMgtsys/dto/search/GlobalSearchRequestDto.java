package Room.ConferenceRoomMgtsys.dto.search;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class GlobalSearchRequestDto {
    private String query;
    private String type; // Optional: filter by entity type (room, booking, user, etc.)
    @Min(0)
    private int page = 0;
    @Min(1)
    private int size = 10;
    private String sortField = "createdAt";
    private String sortOrder = "desc";
}
