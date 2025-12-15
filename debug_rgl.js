
try {
    const WP = require('react-grid-layout/build/WidthProvider');
    console.log('Found build/WidthProvider:', !!WP);
} catch (e) {
    console.log('Failed build/WidthProvider');
}

try {
    const RGL = require('react-grid-layout');
    console.log('Responsive Type:', typeof RGL.Responsive);
    console.log('Keys:', Object.keys(RGL));
} catch (e) {
    console.log(e);
}
