function formattedData(params) {
  const dataFormatted = params.map((item) => {
    const datas = item
      .filter((itemParam) => {
        if (!!itemParam && !!itemParam.GRUPO) {
          return true;
        } else {
          return false;
        }
      })
      .map((itemParam) => [
        { GRUPO: itemParam.GRUPO },
        {},
        { valTotalComissao: itemParam.VAL_N2 },
      ]);
    console.log(datas);
    return datas;
  });
  console.log(dataFormatted);
}
module.exports = formattedData();
