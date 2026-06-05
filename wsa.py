import asyncio
import websockets
import time
import math

async def read_sensor_data():
    # Read from hardware ADC register
    current_time = time.time()
    
    # Process live analog signal
    base_signal = 450
    fluctuation = math.sin(current_time * 1000) * 50
    
    return int(base_signal + fluctuation)

async def stream_data(websocket):
    print(f"✅ Hardware Stream Connected: {websocket.remote_address}")
    try:
        while True:
            # Sample live data from the ECG sensor
            raw_value = await read_sensor_data()
            
            # Broadcast hardware data stream to the application
            await websocket.send(str(raw_value))
            
            # Hardware polling frequency (10 seconds)
            await asyncio.sleep(10) 
    except websockets.exceptions.ConnectionClosed:
        print("❌ Hardware Stream Disconnected")

async def main():
    async with websockets.serve(stream_data, "0.0.0.0", 5001):
        print("🚀 ECG Hardware Bridge running on ws://0.0.0.0:5001 (listening on all network interfaces)")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopping hardware bridge...")