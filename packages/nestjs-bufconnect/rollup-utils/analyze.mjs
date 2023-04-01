const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte';
  const k = 1000;
  const dm = 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} ${
    sizes[index]
  }`;
};

function analyze() {
  return {
    name: 'rollup-plugin-nx-analyzer',
    renderChunk(source, chunk) {
      const sourceBytes = formatBytes(source.length);
      const { fileName } = chunk;
      console.log(`→ ${fileName} ${sourceBytes}`);
    },
  };
}

export { analyze };
