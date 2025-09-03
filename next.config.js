const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb'
    }
  },
  api: {
    bodyParser: {
      sizeLimit: '3mb'
    }
  }
}

module.exports = nextConfig