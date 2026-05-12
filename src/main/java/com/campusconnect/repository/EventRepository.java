package com.campusconnect.repository;

import com.campusconnect.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findAllByStatusOrderByEventDateAscStartTimeAsc(Event.EventStatus status);
}
