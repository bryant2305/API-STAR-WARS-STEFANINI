import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeather(lat: number, lon: number) {
    const res = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
      },
    });
    return res.data.current_weather;
  }
}
