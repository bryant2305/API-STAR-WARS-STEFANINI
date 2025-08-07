import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapiService {
  async getPerson(id: number) {
    const res = await axios.get(`https://swapi.dev/api/people/${id}`);
    return res.data;
  }

  async getPlanet(url: string) {
    const res = await axios.get(url);
    return res.data;
  }
}
