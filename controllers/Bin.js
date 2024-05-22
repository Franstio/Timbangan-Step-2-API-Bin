

export const checkMaxWeight = async () => {
    while (true) {
        const dataBin = await bin.findAll();
        for (let i = 0; i < dataBin.length; i++) {
            console.log({ id: dataBin[i].id });
            const latest = await bin.findOne({
                where: { name_hostname: dataBin[i].name_hostname }
            });
            
            if (latest) {
                console.log(`Weight for ${latest.name_hostname}: ${latest.weight}`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
