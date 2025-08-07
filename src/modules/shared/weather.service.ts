import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeather(lat: number, lon: number) {
    const res = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
      {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
        },
      },
    );
    return res.data.current_weather;
  }
}
