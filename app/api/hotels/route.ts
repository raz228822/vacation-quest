import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req:Request){
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const destination = searchParams.get('destination');
    const roomCount = searchParams.get('roomCount');
    const adults = searchParams.get('adults');
    let entityId;
    let hotelCards = [];

    const options1 = {
    method: 'GET',
    url: 'https://sky-scrapper.p.rapidapi.com/api/v1/hotels/searchDestinationOrHotel',
    params: {query: destination},
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options1);
        entityId = response.data.data[0].entityId;
    } catch (error) {
        console.error(error);
    }

    const options2 = {
    method: 'GET',
    url: 'https://sky-scrapper.p.rapidapi.com/api/v1/hotels/searchHotels',
    params: {
        entityId: entityId,
        checkin: startDate,
        checkout: endDate,
        adults: adults,
        rooms: roomCount,
        limit: '30',
        sorting: '-relevance',
        currency: 'USD',
        market: 'en-US',
        countryCode: 'US'
    },
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options2);
        hotelCards = response.data.data.hotels;
    } catch (error) {
        console.error(error);
    }

    return NextResponse.json({hotelCards, entityId});

}