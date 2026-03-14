/** @type {import('next').NextConfig} */
const nextConfig = {
    // If you want to use Netlify "Drop" (drag and drop), 
    // you must uncomment the line below to create a static 'out' folder.
    // output: 'export',

    // Ensure the build process ignores lint errors for deployment speed
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
