package Room.ConferenceRoomMgtsys;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConferenceRoomMgtsysApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConferenceRoomMgtsysApplication.class, args);
	}

}
