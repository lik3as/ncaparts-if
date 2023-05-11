//this is the database interface with the application user
import methods from "./if-db_methods";
import ps from "prompt-sync";

const prompt = ps();

const message =
`-------------------------------------------------------------------
i - Inserir os dados do arquivo .xlsx
u - Atualizar os dados do banco de dados pelo arquivo .xlsx
s - Substituir todos os dados do banco de dados pelo arquivo .xlsx 
m - Exibir / Parar de exibir o menu 
c - Mudar o caminho do arquivo .xlsx (padrão ../.xlsx)
--------------------------------------------------------------------
`

export default (
    async () => {
    let skip: boolean = false;
    let input: string;

    while(true) {
      (skip) ? void(0) : console.log(message);

      input = prompt('')

      if (input != undefined && input != ''){
        skip = options(input);
        continue;
      }

      await new Promise(res => setTimeout(res, 30000))
    }
  }
)

function options(opt: string): boolean {
  switch (opt){
    case 'i': {
      methods.insert_data()
      return false;
    }
    case 'u': {
      methods.update_data()
      return false;
    }
    case 'm':{
      methods.show_menu()
      return false;
    }
    case 's': {
      methods.substitute_data()
      return false;
    }
    case 'up': {
      methods.update_path()
      return false;
    }
    default: {
      console.log('\x1b[31mNão é uma opção válida!\x1b[0m')
      return true;
    }
  }
}
