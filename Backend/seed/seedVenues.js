require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');

const venues = [
  { name: 'Club Neon', address: 'Downtown Miami' },
  { name: 'Sky Lounge', address: 'Manhattan, New York' },
  { name: 'Blue Note Bar', address: 'Chicago, IL' },
  { name: 'The Tipsy Tiger', address: 'Austin, TX' },
  { name: 'Pulse Nightclub', address: 'Las Vegas, NV' },
  { name: 'Moonlight Tavern', address: 'Portland, OR' },
  { name: 'The Velvet Room', address: 'Los Angeles, CA' },
  { name: 'High Spirits', address: 'Denver, CO' },
  { name: 'Liquid Gold', address: 'Nashville, TN' },
  { name: 'The Barrel House', address: 'Seattle, WA' },
  { name: 'Urban Sip', address: 'San Francisco, CA' },
  { name: 'Eclipse Lounge', address: 'Phoenix, AZ' },
  { name: 'Firefly Bar', address: 'Boston, MA' },
  { name: 'The Copper Mug', address: 'Philadelphia, PA' },
  { name: 'After Hours', address: 'Atlanta, GA' },
  { name: 'The Night Owl', address: 'Dallas, TX' },
  { name: 'Gravity Club', address: 'San Diego, CA' },
  { name: 'Noir Lounge', address: 'Washington, DC' },
  { name: 'The Whiskey Den', address: 'Louisville, KY' },
  { name: 'Sapphire Bar', address: 'Tampa, FL' },
  { name: 'Zenith Club', address: 'Minneapolis, MN' },
  { name: 'Blackout Lounge', address: 'Detroit, MI' },
  { name: 'The Drunken Monk', address: 'New Orleans, LA' },
  { name: 'Cloud 9 Bar', address: 'Salt Lake City, UT' },
  { name: 'The Vault', address: 'Charlotte, NC' },
  { name: 'Crimson Nights', address: 'Richmond, VA' },
  { name: 'The Golden Hour', address: 'Sacramento, CA' },
  { name: 'Midnight Express', address: 'Kansas City, MO' },
  { name: 'The Rusty Anchor', address: 'Baltimore, MD' },
  { name: 'Neon Dreams', address: 'Raleigh, NC' },
  { name: 'The Electric Sheep', address: 'Columbus, OH' },
  { name: 'Starlight Cantina', address: 'Tucson, AZ' },
  { name: 'The Broken Compass', address: 'Buffalo, NY' }
];

const seedVenues = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing venues
    await Venue.deleteMany({});
    
    // Insert new venues
    await Venue.insertMany(venues);
    
    console.log('Venues seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
};

seedVenues();