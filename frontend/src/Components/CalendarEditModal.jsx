import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  DatePicker,
  TimePicker,
  Form,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = TimePicker;

const CalendarEditModal = ({ visible, onClose, email }) => {
  const [summary, setSummary] = useState(email.analysis.subject || "");
  const [description, setDescription] = useState(email.body || "");
  const [date, setDate] = useState(
    email.analysis.date ? dayjs(email.analysis.date) : dayjs()
  );
  const [timeRange, setTimeRange] = useState([
    email.analysis.time ? dayjs(email.analysis.time, "HH:mm") : dayjs(),
    email.analysis.time
      ? dayjs(email.analysis.time, "HH:mm").add(1, "hour")
      : dayjs().add(1, "hour"),
  ]);

  useEffect(() => {
    if (!date.isValid()) {
      setDate(dayjs());
    }
    if (!timeRange[0].isValid() || !timeRange[1].isValid()) {
      setTimeRange([dayjs(), dayjs().add(1, "hour")]);
    }
  }, [date, timeRange]);

  const handleAddToCalendar = async () => {
    try {
      const event = {
        summary,
        description,
        start: {
          dateTime:
            date && timeRange[0]
              ? date
                  .hour(timeRange[0].hour())
                  .minute(timeRange[0].minute())
                  .toISOString()
              : new Date().toISOString(),
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime:
            date && timeRange[1]
              ? date
                  .hour(timeRange[1].hour())
                  .minute(timeRange[1].minute())
                  .toISOString()
              : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeZone: "America/Los_Angeles",
        },
      };

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const expiryDate = localStorage.getItem("expiryDate");

      const response = await axios.post("http://localhost:5000/add-event", {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate,
        event,
      });

      if (response.data.success) {
        message.success("Event added to Google Calendar successfully");
        onClose();
      } else {
        throw new Error("Failed to add event to calendar");
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      message.error("Failed to add event to calendar");
    }
  };

  return (
    <Modal
      title="Edit Event Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleAddToCalendar}>
          Add to Calendar
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Summary">
          <Input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Description">
          <TextArea
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Date">
          <DatePicker
            value={date}
            onChange={(value) => setDate(value)}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Time Range">
          <RangePicker
            value={timeRange}
            onChange={(value) => setTimeRange(value)}
            format="HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CalendarEditModal;
