import list from '../data/applist'

export default (link: any) => {
		for(let i in list){
			if (list[i].link == link) return list[i]
		}
	};