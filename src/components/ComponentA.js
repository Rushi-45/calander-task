import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import '../assets/styles/style.css'
import jsonData from './data.json';

const ComponentA = () => {
    const [workingSchedule, setWorkingSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimezone, setSelectedTimezone] = useState('UTC');
    const [selectedWorkingDays, setSelectedWorkingDays] = useState([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
    ]);
    const [selectedTimes, setSelectedTimes] = useState([
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
    ]);

    useEffect(() => {
        const jsonSchedule = jsonData;
        setWorkingSchedule(jsonSchedule);
    }, []);

    const loadWeeklyWorkingDaysAndTimes = () => {
        const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = [];

        const startTime = moment().tz(selectedTimezone).startOf('day').hour(8);
        const endTime = moment().tz(selectedTimezone).startOf('day').hour(23).minute(0);

        while (startTime.isSameOrBefore(endTime)) {
            times.push(startTime.toDate());
            startTime.add(30, 'minutes');
        }

        setSelectedWorkingDays(workingDays);
        setSelectedTimes(times);
    };

    useEffect(() => {
        loadWeeklyWorkingDaysAndTimes();
    }, [selectedTimezone, selectedDate]);

    const handleTimezoneChange = (timezone) => {
        setSelectedTimezone(timezone);
    };

    const goToPreviousWeek = () => {
        const newDate = moment(selectedDate).subtract(7, 'days').toDate();
        setSelectedDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = moment(selectedDate).add(7, 'days').toDate();
        setSelectedDate(newDate);
    };

    const handleCheckboxChange = (day, time, isChecked) => {
        if (isChecked) {
            setSelectedWorkingDays((prevDays) => [...prevDays, day]);
            setSelectedTimes((prevTimes) => [...prevTimes, time]);
        } else {
            setSelectedWorkingDays((prevDays) => prevDays.filter((d) => d !== day));
            setSelectedTimes((prevTimes) => prevTimes.filter((t) => t !== time));
        }

        const newId = workingSchedule.length;
        const newEntry = {
            Id: newId,
            Date: selectedDate,
            Time: time,
        };
        setWorkingSchedule((prevSchedule) => [...prevSchedule, newEntry]);

    };

    const checkCheckbox = (date, time) => {
        return workingSchedule.some(entry =>
            entry.Date === date.format('YYYY-MM-DD') &&
            entry.Time === time
        );
    };

    const isToday = (day) => {
        const today = moment().tz(selectedTimezone).startOf('day');
        return day.isSame(today, 'day');
    };

    return (
        <div className="container">
            <div className="row my-3">
                <div className="col-12 d-flex justify-content-between">
                    <div>
                        <button className="btn btn-secondary" onClick={goToPreviousWeek}>
                            <i className="bi bi-arrow-left"></i> Previous
                        </button>
                    </div>
                    <div>
                        <DatePicker
                            selected={selectedDate}
                            onChange={setSelectedDate}
                            className="form-control"
                        />
                    </div>
                    <div>
                        <button className="btn btn-secondary" onClick={goToNextWeek}>
                            Next <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="timezone" className="form-label">Timezone:</label>
                <select
                    id="timezone"
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="form-select"
                >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    {moment.tz.names().map((zone) => (
                        <option key={zone} value={zone}>
                            {zone}
                        </option>
                    ))}
                </select>
            </div>
            <div className="table-container">
                <table className="table table-bordered mt-2">
                    <thead>
                        <tr>
                            <th>Day</th>
                            {selectedTimes.map((time, index) => (
                                <th key={index}>{moment(time, 'hh:mm A').tz(selectedTimezone).format('hh:mm a')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 7 }, (_, index) => moment(selectedDate).startOf('week').add(index, 'days')).map((date, dateIndex) => (
                            <tr key={dateIndex}>
                                <td>
                                    {isToday(date) ? (
                                        <strong>{date.format('dddd')}</strong>
                                    ) : (
                                        date.format('dddd')
                                    )}
                                </td>
                                {date.isBefore(moment(selectedDate).startOf('day')) ? (
                                    <td colSpan={selectedTimes.length}>Past</td>
                                ) : (
                                    selectedTimes.map((time, timeIndex) => (
                                        <td key={timeIndex}>
                                            <input
                                                type="checkbox"
                                                checked={checkCheckbox(date, moment(time, 'hh:mm A').tz(selectedTimezone).format('HH:mm'))}
                                                onChange={(e) => handleCheckboxChange(date, moment(time, 'hh:mm A').tz(selectedTimezone).format('HH:mm'), e.target.checked)}
                                            />
                                        </td>
                                    ))
                                )}

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComponentA;
