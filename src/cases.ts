import xlsx from 'xlsx'
import PromptSync from 'prompt-sync';
import fs from 'fs'
import path from 'path'
import { instance, cats } from './if-db';
const prompt = PromptSync();

const xlpath: string = path.resolve(__dirname, '..', 'db.xlsx')
let wb: xlsx.WorkBook = xlsx.utils.book_new();

if (fs.existsSync(xlpath)) {
  wb = xlsx.readFile(xlpath);
}

let ws: xlsx.WorkSheet;

console.log(xlpath);

export default {
  generate(table: string, columns: string[]): void {
    ws = xlsx.utils.aoa_to_sheet([columns], {cellStyles: true})
    try{
      console.log(columns);
      xlsx.utils.book_append_sheet(wb, ws, table);

      xlsx.writeFileXLSX(wb, xlpath);
    } catch (err) {
      console.log('Um erro ocorreu: \x1b[31m' + err + '\x1b[0m' +
      '\nVerifique se a planilha já existe');
    }
  },

  async insert(table: string): Promise<void> {
    let url: string = cats.includes(table)
    ? `Produtos/${table}?m=many&object_type=body`
    : `${table}?m=many&object_type=body`;
  
    const wb_new: xlsx.WorkBook = xlsx.readFile(xlpath);
    const bodies: {}[] = xlsx.utils.sheet_to_json(wb_new.Sheets[table])

    let bodies_map: [key: string, value: any][] = [];
    let bodies_obj: {}[] = [];

    //converte de string para boolean se o valor for "sim" ou "não"
    bodies.forEach((body) => {
      Object.entries(body).forEach(([key, value]) => { 
        const valueArray = (value as string).toString().split(",").map((val) => val.trim());

        if (value == "sim" || (value == "não" || value == "nao")) {
          bodies_map.push([key, (value == "sim") ? true : false]);
        } else if(valueArray.length >= 1 && (key as string)[(key as string).length - 1] == "s"){
          (valueArray && valueArray.length > 0)
          ? bodies_map.push([key, valueArray])
          : bodies_map.push([key, ['']]);
        } else {
          bodies_map.push([key, value]);
        }
      });
      bodies_obj.push(Object.fromEntries(bodies_map));
      bodies_map = []
    });

    console.log('Esta tabela contém dados já existentes no banco de dados? (s/n)');
    (prompt('') == 's') ? url += '&b=bulk' : void(0);

    console.log('O \x1b[32mservidor\x1b[0m diz: ')
    const data = (await instance.post(url, bodies_obj)).data
    console.log(data);
  },

  async update(table: string): Promise<void> {
    let url: string = cats.includes(table)
    ? `Produtos/${table}?m=many&u=update`
    : `${table}?m=many&u=update`;

    const wb_new: xlsx.WorkBook = xlsx.readFile(xlpath);
    const bodies: {}[] = xlsx.utils.sheet_to_json(wb_new.Sheets[table])

    let bodies_map: [key: string, value: any][] = [];
    let bodies_obj: {}[] = [];

    //converte de string para boolean se o valor for "sim" ou "não"
    bodies.forEach((body) => {
      Object.entries(body).forEach(([key, value]) => { 
        if (value == "sim" || (value == "não" || value == "nao")) {
          bodies_map.push([key, (value == "sim") ? true : false]);
        } else {
          bodies_map.push([key, value]);
        }
      });
      bodies_obj.push(Object.fromEntries(bodies_map));
      bodies_map = []
    });

    const response = (await instance.post(url, bodies_obj)).data
    console.log(response);
  }
}