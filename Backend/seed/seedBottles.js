require('dotenv').config();
const mongoose = require('mongoose');
const Bottle = require('../models/Bottle');
const Venue = require('../models/Venue');

// Sample bottle data - each bottle has its own fixed price for the full bottle
const bottleTemplates = [
  // Whiskey
  { name: 'Black Label', brand: 'Johnnie Walker', price: 4500, volume: '750ml' },
  { name: 'Blue Label', brand: 'Johnnie Walker', price: 12000, volume: '750ml' },
  { name: 'Single Malt 12 Year', brand: 'Glenfiddich', price: 6500, volume: '750ml' },
  { name: 'Reserve 18 Year', brand: 'Chivas Regal', price: 8500, volume: '750ml' },
  { name: 'Signature Premium', brand: 'Royal Challenge', price: 2800, volume: '750ml' },
  { name: 'Gold Reserve', brand: 'Blenders Pride', price: 2200, volume: '750ml' },
  { name: 'Rare Reserve', brand: 'Royal Stag', price: 1800, volume: '750ml' },
  
  // Vodka
  { name: 'Premium', brand: 'Grey Goose', price: 7500, volume: '750ml' },
  { name: 'Classic', brand: 'Absolut', price: 3500, volume: '750ml' },
  { name: 'Original', brand: 'Smirnoff', price: 2800, volume: '750ml' },
  { name: 'Elite', brand: 'Beluga', price: 9500, volume: '750ml' },
  { name: 'Premium', brand: 'Ciroc', price: 8000, volume: '750ml' },
  
  // Rum
  { name: 'Gold', brand: 'Bacardi', price: 3200, volume: '750ml' },
  { name: 'Spiced', brand: 'Captain Morgan', price: 3800, volume: '750ml' },
  { name: 'Dark Rum', brand: 'Old Monk', price: 1500, volume: '750ml' },
  { name: 'White Rum', brand: 'Bacardi', price: 2800, volume: '750ml' },
  
  // Gin
  { name: 'London Dry', brand: 'Bombay Sapphire', price: 4200, volume: '750ml' },
  { name: 'Classic', brand: 'Tanqueray', price: 4500, volume: '750ml' },
  { name: 'Premium', brand: 'Hendricks', price: 6500, volume: '750ml' },
  
  // Tequila
  { name: 'Silver', brand: 'Jose Cuervo', price: 4800, volume: '750ml' },
  { name: 'Reposado', brand: 'Patron', price: 8500, volume: '750ml' },
  { name: 'Blanco', brand: '1800 Tequila', price: 5500, volume: '750ml' },
  
  // Wine
  { name: 'Cabernet Sauvignon', brand: 'Sula', price: 1200, volume: '750ml' },
  { name: 'Chardonnay', brand: 'Grover', price: 1500, volume: '750ml' },
  { name: 'Shiraz', brand: 'Fratelli', price: 1800, volume: '750ml' },
  { name: 'Sauvignon Blanc', brand: 'York', price: 1400, volume: '750ml' },
  { name: 'Merlot', brand: 'Four Seasons', price: 1600, volume: '750ml' },
  
  // Champagne & Sparkling
  { name: 'Brut', brand: 'Chandon', price: 3500, volume: '750ml' },
  { name: 'Rose', brand: 'Moet & Chandon', price: 8500, volume: '750ml' },
  { name: 'Sparkling Wine', brand: 'Sula', price: 1800, volume: '750ml' },
  
  // Beer (Large Bottles)
  { name: 'Premium Lager', brand: 'Kingfisher', price: 200, volume: '500ml' },
  { name: 'Ultra', brand: 'Kingfisher', price: 250, volume: '500ml' },
  { name: 'Premium', brand: 'Heineken', price: 300, volume: '500ml' },
  { name: 'Wheat Beer', brand: 'Hoegaarden', price: 350, volume: '500ml' },
  { name: 'Strong', brand: 'Tuborg', price: 220, volume: '500ml' },
  
  // Liqueurs
  { name: 'Triple Sec', brand: 'Cointreau', price: 5500, volume: '750ml' },
  { name: 'Amaretto', brand: 'Disaronno', price: 4800, volume: '750ml' },
  { name: 'Coffee Liqueur', brand: 'Kahlua', price: 4200, volume: '750ml' },
  { name: 'Irish Cream', brand: 'Baileys', price: 3800, volume: '750ml' }
];

// Function to generate random amount between min and max
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to randomly select bottles for a venue
const selectBottlesForVenue = () => {
  const numBottles = randomAmount(20, 35); // Each venue gets 20-35 different bottles
  const selectedBottles = [];
  
  // Shuffle and select random bottles
  const shuffled = [...bottleTemplates].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numBottles && i < shuffled.length; i++) {
    const template = shuffled[i];
    
    selectedBottles.push({
      name: template.name,
      brand: template.brand,
      volume: template.volume,
      price: template.price, // Fixed price for the full bottle
      amount: randomAmount(5, 50), // Random stock between 5-50 bottles
      isAvailable: Math.random() > 0.1 // 90% chance of being available
    });
  }
  
  return selectedBottles;
};

const seedBottles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all venues
    const venues = await Venue.find({});
    
    if (venues.length === 0) {
      console.log('No venues found. Please run seedVenues.js first.');
      process.exit(1);
    }
    
    // Delete existing bottles
    await Bottle.deleteMany({});
    
    const allBottles = [];
    
    // Generate bottles for each venue
    venues.forEach((venue, index) => {
      const venueBottles = selectBottlesForVenue();
      
      venueBottles.forEach(bottleData => {
        allBottles.push({
          ...bottleData,
          venue: venue._id
        });
      });
      
      console.log(`Generated ${venueBottles.length} bottles for ${venue.name}`);
    });
    
    // Insert all bottles
    await Bottle.insertMany(allBottles);
    
    console.log(`Bottles seeded successfully for ${venues.length} venues`);
    console.log(`Total bottles created: ${allBottles.length}`);
    console.log(`Average bottles per venue: ${Math.round(allBottles.length / venues.length)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bottles:', error);
    process.exit(1);
  }
};

seedBottles();