import React, { useState } from 'react';
import styles from '../../css/parking.module.css'
import range from 'lodash/range';
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import differenceInMinutes from 'date-fns/differenceInMinutes'

const Grid = ({ entrances, slots, rates, onParkCar }) => {
    console.log('slots', slots);
    console.log('rates', rates);
    const [car, setCar] = useState({
        plate: '',
        size: 'small',
        started: 0
    })
    const [message, setMessage] = useState('')
    let rows = ['small', 'medium', 'large'].map(size => {
        let sizeSlots = slots.filter(slot => slot.size === size).map((slot, index) => {
            let distances = range(0, entrances)
                .map((entrance) => {
                    let entranceNumber = (+entrance) + 1;
                    return (<p key={`size-${size}entrance-${entrance}`}>
                        {`From entrance ${entranceNumber}: ${slot[entrance]}`}
                    </p >)
                })

            let carSpot;
            if (slot.taken) {
                let hourDifferential = Math.round(differenceInMinutes(new Date(), new Date(slot.carDetails.started)) / 60)
                console.log('hourDifferential', hourDifferential);
                let charge = rates[slot.size]
                if (hourDifferential) {
                    charge *= hourDifferential;
                }

                if (hourDifferential >= 24) {
                    charge = Math.floor(hourDifferential / 24) * rates['penalty']

                    charge += (hourDifferential % 24) * rates[slot.size]
                }

                carSpot = (
                    <div>
                        <h3 className="font-bold py-3">{slot.carDetails.plate}</h3>
                        <p>{formatDistanceToNow(new Date(slot.carDetails.started), { addSuffix: true })}</p>
                        <p>
                            Charge: {charge} php
                        </p>
                        <button onClick={() => { onParkCar(slot.id, false); setMessage('') }}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-text hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">Clear Spot</button>
                    </div>
                )
            }

            return (
                <div key={`slot-${index}`} className={`text-sm mr-1 p-4 rounded-sm w-30 ${slot.taken ? 'bg-red-300' : 'bg-green-300'}`}>
                    {distances}
                    {carSpot}
                </div >
            )
        })

        return (
            <div key={`size-${size}`} className={styles.parkingGrid}>
                <p className="w-20 pr-1">
                    {size}
                </p>
                {sizeSlots}
            </div>
        )
    })

    const handleSizeInput = (e) => {
        const { value } = e.target;
        setCar({ ...car, size: value })
    }

    const handlePlateInput = (e) => {
        const { value } = e.target;
        setCar({ ...car, plate: value })
    }

    const handlePark = (e) => {
        e.preventDefault()
        let validSlotsForSize = slots.filter(slot => {
            if (slot.taken) {
                return false
            }

            let sizeMap = {
                'small': 0,
                'medium': 1,
                'large': 2
            }

            return sizeMap[slot.size] >= sizeMap[car.size]
        }).map(slot => {
            console.log('slot', slot);
            let distances = range(0, entrances).map(entrance => slot[entrance])

            return { distances, id: slot.id }
        })

        console.log('validSlotsForSize', validSlotsForSize);

        if (!validSlotsForSize.length) {
            return setMessage('No space available')
        }

        var nearest = 9999
        var nearestParkingId = ''
        validSlotsForSize.map(slot => {
            let nearestSlot = Math.min(...slot.distances)
            console.log('nearestSlot', nearestSlot);
            if (nearestSlot < nearest) {
                nearest = nearestSlot
                nearestParkingId = slot.id
                console.log('slot', slot);
            }
        })

        console.log('nearestParkingId', nearestParkingId);
        return onParkCar(nearestParkingId, true, { ...car, started: +new Date() })
    }

    return (
        <form onSubmit={handlePark}>
            <div >
                {rows}
            </div>
            <div className="lg:flex items-center mt-4">
                <input type="text"
                    className="w-full lg:inline mt-1 focus:ring-indigo-500 m-1 p-2 focus:border-indigo-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
                    defaultValue={car.plate}
                    placeholder="Enter plate" onChange={e => handlePlateInput(e)}></input>
                <select defaultValue={car.size}
                    className="w-full lg:inline mt-1 focus:ring-indigo-500 m-1 p-2 focus:border-indigo-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
                    style={{ display: "inline-block" }} name="" onChange={e => handleSizeInput(e)}>
                    <option value="small">
                        small
    					</option>
                    <option value="medium">
                        medium
    					</option>
                    <option value="large">
                        large
    					</option>
                </select>
                <button type="submit"
                    className="w-full lg:inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-text hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    style={{ display: "inline-block" }}>Park this Car</button>
            </div>
            {message ? <p class="p-3 text-red-500">{message}</p> : ''}
        </form>

    );
};

export default Grid;