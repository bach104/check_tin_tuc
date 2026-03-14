import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const colors = {
  success: chalk.hex('#10b981'), 
  error: chalk.hex('#ef4444'),    
  info: chalk.hex('#3b82f6'),     
  warning: chalk.hex('#f59e0b'),  
  highlight: chalk.hex('#8b5cf6'),
  dim: chalk.hex('#64748b')       
};

const showBanner = () => {
  console.log();
  console.log(colors.highlight('╔══════════════════════════════════════════════════════════╗'));
  console.log(colors.highlight('║                                                          ║'));
  console.log(colors.highlight('║   🛡️  AI FACT CHECKER - MONGODB CONNECTION MANAGER  🛡️   ║'));
  console.log(colors.highlight('║                                                          ║'));
  console.log(colors.highlight('╚══════════════════════════════════════════════════════════╝'));
  console.log();
};

// Spinner animation
const spinner = (text) => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r${colors.info(frames[i])} ${colors.dim(text)}`);
    i = (i + 1) % frames.length;
  }, 80);
};

// Format connection time
const formatTime = () => {
  return new Date().toLocaleTimeString('vi-VN', { 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

// 
const formatConnectionDetails = (conn) => {
  const details = [];
  
  
  details.push(colors.info('📡 Host:') + ' ' + colors.success(conn.connection.host));
  
  
  const dbName = conn.connection.name || 'factcheck';
  details.push(colors.info('🗄️  Database:') + ' ' + colors.success(dbName));
  
  
  const port = conn.connection.port || 27017;
  details.push(colors.info('🔌 Port:') + ' ' + colors.success(port));
  
  
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[conn.connection.readyState];
  details.push(colors.info('⚡ Status:') + ' ' + colors.success(state.toUpperCase()));
  
  return details;
};


const connectDB = async () => {
  
  console.clear();
  showBanner();
  
  console.log(colors.dim('⏰ Time:'), colors.info(formatTime()));
  console.log(colors.dim('📍 Environment:'), process.env.NODE_ENV ? colors.warning(process.env.NODE_ENV.toUpperCase()) : colors.warning('DEVELOPMENT'));
  console.log();
  
  
  console.log(colors.info('🔄 Initiating MongoDB connection...'));
  console.log(colors.dim('└─ URI:'), colors.dim(process.env.DB_MONGODB?.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')));
  console.log();
  
  
  const spinnerInterval = spinner('Connecting to MongoDB Atlas...');
  
  try {
    const startTime = Date.now();
    
    
    const conn = await mongoose.connect(process.env.DB_MONGODB, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    const endTime = Date.now();
    const connectionTime = ((endTime - startTime) / 1000).toFixed(2);
    
    
    clearInterval(spinnerInterval);
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
    
    
    console.log();
    console.log(colors.success('╭────────────────────────────────────────────────────────────╮'));
    console.log(colors.success('│                     ✅ CONNECTION SUCCESS                    │'));
    console.log(colors.success('╰────────────────────────────────────────────────────────────╯'));
    console.log();
    
    
    console.log(colors.highlight('📊 CONNECTION DETAILS:'));
    console.log(colors.dim('┌────────────────────────────────────────────────────────┐'));
    
    const details = formatConnectionDetails(conn);
    details.forEach(line => {
      console.log(colors.dim('│') + ' ' + line.padEnd(55) + colors.dim('│'));
    });
    
    console.log(colors.dim('├────────────────────────────────────────────────────────┤'));
    console.log(colors.dim('│') + ' ' + colors.info('⚡ Response time:').padEnd(25) + colors.success(`${connectionTime}s`.padStart(10)) + ' '.repeat(20) + colors.dim('│'));
    console.log(colors.dim('└────────────────────────────────────────────────────────┘'));
    console.log();
    
    // Database stats
    if (conn.connection.db) {
      try {
        const stats = await conn.connection.db.stats();
        console.log(colors.highlight('📈 DATABASE STATISTICS:'));
        console.log(colors.dim('┌────────────────────────────────────────────────────────┐'));
        console.log(colors.dim('│') + ' ' + colors.info('Collections:').padEnd(25) + colors.success(String(stats.collections || 0).padStart(10)) + ' '.repeat(20) + colors.dim('│'));
        console.log(colors.dim('│') + ' ' + colors.info('Documents:').padEnd(25) + colors.success(String(stats.objects || 0).padStart(10)) + ' '.repeat(20) + colors.dim('│'));
        console.log(colors.dim('│') + ' ' + colors.info('Data size:').padEnd(25) + colors.success(formatBytes(stats.dataSize || 0).padStart(10)) + ' '.repeat(20) + colors.dim('│'));
        console.log(colors.dim('│') + ' ' + colors.info('Storage size:').padEnd(25) + colors.success(formatBytes(stats.storageSize || 0).padStart(10)) + ' '.repeat(20) + colors.dim('│'));
        console.log(colors.dim('│') + ' ' + colors.info('Indexes:').padEnd(25) + colors.success(String(stats.indexes || 0).padStart(10)) + ' '.repeat(20) + colors.dim('│'));
        console.log(colors.dim('└────────────────────────────────────────────────────────┘'));
      } catch (statsError) {
        // Silently fail if can't get stats
      }
    }
    
    console.log();
    console.log(colors.success('✨ MongoDB connection established successfully! ✨'));
    console.log(colors.dim('⏱️  Ready to handle database operations'));
    console.log();
    
    return conn;
  } catch (error) {
    // Clear spinner
    clearInterval(spinnerInterval);
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
    
    // Error message with style
    console.log();
    console.log(colors.error('╭────────────────────────────────────────────────────────────╮'));
    console.log(colors.error('│                     ❌ CONNECTION FAILED                     │'));
    console.log(colors.error('╰────────────────────────────────────────────────────────────╯'));
    console.log();
    
    console.log(colors.error('🔴 ERROR DETAILS:'));
    console.log(colors.dim('┌────────────────────────────────────────────────────────┐'));
    
    // Split error message into multiple lines if too long
    const errorMsg = error.message;
    const maxLength = 55;
    if (errorMsg.length > maxLength) {
      const words = errorMsg.split(' ');
      let line = '';
      words.forEach(word => {
        if ((line + word).length > maxLength) {
          console.log(colors.dim('│') + ' ' + colors.error(line.padEnd(maxLength)) + colors.dim('│'));
          line = word + ' ';
        } else {
          line += word + ' ';
        }
      });
      if (line) {
        console.log(colors.dim('│') + ' ' + colors.error(line.padEnd(maxLength)) + colors.dim('│'));
      }
    } else {
      console.log(colors.dim('│') + ' ' + colors.error(errorMsg.padEnd(maxLength)) + colors.dim('│'));
    }
    
    console.log(colors.dim('└────────────────────────────────────────────────────────┘'));
    console.log();
    
    // Suggestions
    console.log(colors.warning('💡 SUGGESTIONS:'));
    console.log(colors.dim('  • Check your network connection'));
    console.log(colors.dim('  • Verify MongoDB URI in .env file'));
    console.log(colors.dim('  • Ensure IP whitelist includes your current IP'));
    console.log(colors.dim('  • Check if username/password is correct'));
    console.log(colors.dim('  • Verify database user has proper permissions'));
    console.log();
    
    console.error(colors.error('❌ Exiting process due to connection failure...'));
    process.exit(1);
  }
};

// Helper function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log();
  console.log(colors.warning('⚠️  MongoDB disconnected!'));
  console.log(colors.dim(`🕒 ${formatTime()}`));
});

mongoose.connection.on('reconnected', () => {
  console.log();
  console.log(colors.success('🔄 MongoDB reconnected successfully!'));
  console.log(colors.dim(`🕒 ${formatTime()}`));
});

mongoose.connection.on('error', (err) => {
  console.log();
  console.log(colors.error('🔴 MongoDB connection error:'), err);
});

export default connectDB;