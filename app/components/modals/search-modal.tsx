"use client";

import Modal from "./Modal";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import qs from 'query-string';
import { format, formatISO } from "date-fns";
import Heading from "../Heading";
import Calendar from "../inputs/Calendar";
import Counter from "../inputs/Counter";
import GeocodingMap from "../Geocoding";
import useSearchModal from "@/app/hooks/useSearchModal";
import toast from "react-hot-toast";

enum STEPS {
    LOCATION = 0,
    DESTINATION = 1,
    DATE = 2,
    INFO = 3
}

const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();
    const [destination, setDestination] = useState('');
    const [location, setLocation] = useState('');
    const [originPosition, setOriginPosition] = useState<[number, number]>([51.1657, 10.4515]);
    const [position, setPosition] = useState<[number, number]>([51.1657, 10.4515]);
    const [step, setStep] = useState(STEPS.LOCATION);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [roomCount, setRoomCount] = useState(1);
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });


    const onBack = useCallback(() => {
        setStep((value) => value - 1);
    }, [])
    
    const onNext = useCallback(() => {
        if (step === STEPS.LOCATION && location === ''){
            toast.error('You must enter a location and locate in map to continue.');
            return;
        }
        if (step === STEPS.DESTINATION && destination === ''){
            toast.error('You must enter a location and locate in map to continue.');
            return;
        }
        
        setStep((value) => value + 1);
    }, [step, location, destination])

    const onSubmit = useCallback(async () => {
        if (step !== STEPS.INFO) {
            return onNext();
        }
        
        let currentQuery = {};

        if (params){
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            location,
            destination,
            originPosition: JSON.stringify(originPosition),
            position: JSON.stringify(position),
            adults,
            children,
            roomCount
        }

        if (dateRange.startDate) {
            updatedQuery.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
        }

        if(dateRange.endDate) {
            updatedQuery.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        setStep(STEPS.LOCATION);
        searchModal.onClose();
        router.push("/flights/" + url);
    }, [step, searchModal, destination, location, router, adults, roomCount, dateRange, onNext, params, children, originPosition, position]);

    const actionLabel = useMemo(() => {
        if(step === STEPS.INFO){
            return 'Search';
        }

        return 'Next';
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if(step === STEPS.LOCATION){
            return undefined;
        }

        return 'Back';
    }, [step] )

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading 
                title="From"
                subtitle="Search and select your location"
            />
            <GeocodingMap location={location} setLocation={setLocation} position={originPosition} setPosition={setOriginPosition}/>
        </div>
    )

    if (step === STEPS.DESTINATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="To"
                    subtitle="Search and select your destination"
                />
                <GeocodingMap location={destination} setLocation={setDestination} position={position} setPosition={setPosition}/>
            </div>
        )
    }

    if (step === STEPS.DATE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="When do you plan to go?"
                    subtitle="Make sure everyone is free!"
                />
                <Calendar
                    value={dateRange}
                    onChange={(value) => setDateRange(value.selection)}
                />
            </div>
        )
    }

    if (step === STEPS.INFO){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="More information"
                    subtitle="Find your perfect place"
                />
                <Counter 
                    title="Adults"
                    subtitle="How many adults are coming?"
                    value={adults}
                    onChange={(value) => setAdults(value)}
                />
                <Counter 
                    title="Children"
                    subtitle="How many children are coming?"
                    value={children}
                    onChange={(value) => setChildren(value)}
                />
                <Counter 
                    title="Rooms"
                    subtitle="How many rooms do you need?"
                    value={roomCount}
                    onChange={(value) => setRoomCount(value)}
                />
            </div>
        )
    }
    return ( 
        <Modal 
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="Filters"
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
            body={bodyContent}
        />
     );
}
 
export default SearchModal;

