package Room.ConferenceRoomMgtsys.dto.search;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class GlobalSearchResultDto {
    private long totalResults;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private List<Map<String, Object>> results;
}
