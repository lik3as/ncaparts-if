import ps from "prompt-sync";
import axios from "axios";
import dotenv from 'dotenv';
import path from "path";

import case_functions from './cases';

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({
  path: envPath
});

const url = process.env.REST_API;
export const cats = ["Tipos", "Marcas", "Modelos", "Grupos"];
export const instance = axios.create({
  baseURL: url,
  maxRedirects: 1,
});

const prompt = ps();

let message =
`-------------------------------------------------------------------
i - Inserir os dados do arquivo 
u - Atualizar os dados do banco de dados pelo arquivo 
s - Substituir todos os dados do banco de dados pelo arquivo 
v - Verificar tabelas existentes
m - Exibir / Parar de exibir o menu 
p - Mudar o caminho do arquivo .xlsx (padrão ../.xlsx)
c - Consultar as tabelas
g - Gerar uma planilha para a tabela
--------------------------------------------------------------------
`;

let run: boolean = true;
export default (
  async () => {

    const token = (await instance.post("auth/User", {
      username: process.env.MASTER_NAME, passwd: process.env.MASTER_SECRET
    }, { withCredentials: true  })).headers['set-cookie']![1];

    console.log("Sua token é: " + token + "\n");

    instance.defaults.headers.post = { Cookie: token }
    instance.defaults.headers.get = { Cookie: token }
    
    let input: string;

    while(true) {
      run ? console.log('\n' + message) : void(0);

      input = prompt('')

      if (input != undefined && input != '') {
        try{
          run = await options(input);
        } catch(e) {
          console.log("Error: " + e)
        }
        continue;
      }

      await new Promise(res => setTimeout(res, 3000))
    }
  }
)

async function options(opt: string): Promise<boolean> {

  switch (opt){
    case 'i': {
      const table = prompt('Tabela da inserção: ');
      await case_functions.insert(table);

      return run;
    }
    case 'u': {
      const table = prompt('Tabela da atualização: ')
      await case_functions.update(table);
      return run;
    }
    case 'm':{
      return !run;
    }
    case 's': {
      return run;
    }
    case 'up': {
      return run;
    }
    case 'v': {
      const data: string[] = (await instance.get('/')).data
      const regex: RegExp =  /[A-Z][^A-Z]*[A-Z]/;
      const filtered_data = data.filter(str => !regex.test(str));

      console.log(filtered_data);

      return run;
    }
    case 'p': {
      return run;
    }
    case 'c': {
      const table = prompt('Tabela da consulta: ');
      const url = (cats.includes(table) ? `Produtos/${table}` : table)
      const data = (await instance.get(url)).data
      console.log(data);
      return run;
    }
    case 'g': {
      const table = prompt('Tabela fonte: ');
      const columns: Object = (await instance.get(table + '/columns')).data
      
      const properties: string[] = Object.keys(columns).filter(str => !str.includes('created') && !str.includes('updated'))

      let fprop: string[] = []; //Formatted properties

      properties.forEach((val, _, ) => {
        if (val.includes('fk_'))  fprop.push(val.split('_')[1]); 
        else if (val != 'fk'){
          fprop.push(val);
        }
      })

      case_functions.generate(table, fprop);
      console.log('Tabela gerada');
      return run;
    }
    default: {
      console.log('\x1b[31mNão é uma opção válida!\x1b[0m')
      return true;
    }
  }
}
