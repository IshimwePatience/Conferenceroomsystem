package Room.ConferenceRoomMgtsys.controller;

import Room.ConferenceRoomMgtsys.dto.search.GlobalSearchRequestDto;
import Room.ConferenceRoomMgtsys.dto.search.GlobalSearchResultDto;
import Room.ConferenceRoomMgtsys.service.GlobalSearchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = { "http://localhost:5173", "https://conferenceroomsystem.vercel.app" })
public class GlobalSearchController {

    private final GlobalSearchService searchService;

    public GlobalSearchController(GlobalSearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    public GlobalSearchResultDto search(
            @Valid @RequestBody GlobalSearchRequestDto request) {
        return searchService.search(request);
    }
}
